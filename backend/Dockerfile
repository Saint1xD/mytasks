# Use an official Go runtime as the parent image
FROM golang:1.21-alpine

# Set the working directory in the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies
RUN go mod download
RUN go get -u github.com/rs/cors

# Copy the source code into the container
COPY . .

# Copy the init.sql file
COPY init.sql .

# Build the application
RUN go build -o main .

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run the executable
CMD ["./main"]
