# Task Management Application

This is a task management application built with Next.js, Go, and PostgreSQL.

## Prerequisites

Before you begin, ensure you have met the following requirements:

* You have installed the latest version of [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/).
* You have a Windows/Linux/Mac machine with WSL2 enabled if you're on Windows.

## Installing Task Management Application

To install the Task Management Application, follow these steps:

1. Clone the repository
2. Navigate to the project directory

## Using Task Management Application

To use Task Management Application, follow these steps:

```bash
# Build and start the containers
docker compose up --build

# In a new terminal, initialize the database
docker compose exec db psql -U username -d taskdb -f /app/backend/init.sql
```

Now you can access the application at `http://localhost:3000`

## Stopping the Application

To stop the application, use:

```bash
docker compose down
```

## Troubleshooting

If you encounter any issues with Docker commands, ensure that Docker is running and that you're in the project root directory when running the commands.

## Contributing to Task Management Application

To contribute to Task Management Application, follow these steps:

1. Fork this repository.
2. Create a branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin <project_name>/<location>`
5. Create the pull request.

Alternatively, see the GitHub documentation on [creating a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).
