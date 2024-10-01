package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
)

type Task struct {
	ID          string  `json:"id"`
	Title       string  `json:"title"`
	Description *string `json:"description"`
	Status      string  `json:"status"`
	Label       *string `json:"label"`
	Priority    string  `json:"priority"`
}

var db *sql.DB

func main() {
	log.Println("Starting the application...")

	var err error
	db, err = sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal("Error connecting to the database: ", err)
	}
	defer db.Close()

	// Test the database connection
	err = db.Ping()
	if err != nil {
		log.Fatal("Error pinging the database: ", err)
	}
	log.Println("Successfully connected to the database")

	// Ensure the tasks table exists
	_, err = db.Exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        label TEXT,
        priority TEXT NOT NULL
    )`)
	if err != nil {
		log.Fatal("Error creating tasks table: ", err)
	}
	log.Println("Tasks table is ready")

	router := mux.NewRouter()
	router.HandleFunc("/tasks", getTasks).Methods("GET")
	router.HandleFunc("/tasks", createTask).Methods("POST")
	router.HandleFunc("/tasks/{id}", updateTask).Methods("PUT")
	router.HandleFunc("/tasks/{id}", deleteTask).Methods("DELETE")

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	})

	handler := c.Handler(router)

	log.Println("Server is starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

func getTasks(w http.ResponseWriter, r *http.Request) {
	// log.Println("Fetching tasks...")
	rows, err := db.Query("SELECT id, title, description, status, label, priority FROM tasks")
	if err != nil {
		log.Println("Error querying tasks: ", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var tasks []Task
	for rows.Next() {
		var t Task
		var description, label sql.NullString
		if err := rows.Scan(&t.ID, &t.Title, &description, &t.Status, &label, &t.Priority); err != nil {
			log.Println("Error scanning task row: ", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if description.Valid {
			t.Description = &description.String
		}
		if label.Valid {
			t.Label = &label.String
		}

		tasks = append(tasks, t)
	}

	// log.Printf("Returning %d tasks\n", len(tasks))
	json.NewEncoder(w).Encode(tasks)
}

func createTask(w http.ResponseWriter, r *http.Request) {
	var t Task
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var descriptionArg, labelArg interface{}
	if t.Description != nil {
		descriptionArg = *t.Description
	}
	if t.Label != nil {
		labelArg = *t.Label
	}

	err := db.QueryRow("INSERT INTO tasks (title, description, status, label, priority) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		t.Title, descriptionArg, t.Status, labelArg, t.Priority).Scan(&t.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(t)
}

func updateTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var t Task
	json.NewDecoder(r.Body).Decode(&t)

	_, err := db.Exec("UPDATE tasks SET title=$1, description=$2, status=$3, label=$4, priority=$5 WHERE id=$6",
		t.Title, t.Description, t.Status, t.Label, t.Priority, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	t.ID = id
	json.NewEncoder(w).Encode(t)
}

func deleteTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	_, err := db.Exec("DELETE FROM tasks WHERE id=$1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
