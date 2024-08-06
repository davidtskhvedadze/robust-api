<h1 align="center">Robust-API</h1>
<div align="center">
This is a simple Express.js application that includes middleware for logging and metrics, and exposes an endpoint for Prometheus metrics.
</div>

## Tech Stack
<div align="center">
<img src="https://skillicons.dev/icons?i=nodejs,express,postgres,redis,prometheus,grafana" alt="Tech Stack">
</div>
<div align="center">This application uses Nodejs, Express, PostgreSQL, Redis, Prometheus, & Grafana</div>

## Features
- Middleware for logging requests
- Middleware for collecting metrics
- Routes for handling post-related requests
- Endpoint to expose metrics for Prometheus
- Redis caching for improved performance

## Notes
- Ensure that the logging and metrics middleware are correctly implemented in the `./middleware/loggingMiddleware` and `./middleware/metricsMiddleware` files.
- The post routes should be defined in the `./routes/postRoutes` file.
- You will need to install Prometheus and Grafana to monitor the data locally.
- Ensure you have a `.env` file with the following environment variables:

    ```properties
    PORT=3001
    DATABASE_URL=postgres://<username>:<password>@<host>/<database>
    REDIS_PASSWORD=<redis_password>
    REDIS_HOST=<redis_host>
    REDIS_PORT=<redis_port>
    ```

## Installation
1. Clone the repository:
    ```sh
    git clone <repository-url>
    ```
2. Navigate to the project directory:
    ```sh
    cd <project-directory>
    ```
3. Install the dependencies:
    ```sh
    npm install
    ```
4. Start the application:
    ```sh
    npm start
    ```

## Setting Up Prometheus and Grafana
1. Download and install Prometheus from the [official website](https://prometheus.io/download/).
2. Configure Prometheus to scrape metrics from your Express app by adding the following job to your `prometheus.yml` configuration file:
    ```yaml
    scrape_configs:
      - job_name: 'express_app'
        static_configs:
          - targets: ['localhost:3001']  # Adjust the port if necessary
    ```
3. Start Prometheus:
    ```sh
    ./prometheus --config.file=prometheus.yml
    ```
4. Download and install Grafana from the [official website](https://grafana.com/grafana/download).
5. Start Grafana:
    ```sh
    ./bin/grafana-server
    ```
6. Open Grafana in your browser (default: `http://localhost:3000`), add Prometheus as a data source, and create dashboards to visualize your metrics.

## Metrics
I am collecting the following types of metrics to monitor the performance and usage of our application:

- **Request Duration**: Measures the duration of HTTP requests in seconds. This helps in understanding the latency of the application.
    ```javascript
    const httpRequestDurationMicroseconds = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.2, 0.5, 1, 1.5, 2, 5]
    });
    ```

- **Total Requests**: Counts the total number of HTTP requests. This helps in understanding the load on the application.
    ```javascript
    const httpRequestsTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    });
    ```

- **Request Size**: Measures the size of HTTP requests in bytes. This helps in understanding the data being sent to the application.
    ```javascript
    const httpRequestSizeBytes = new promClient.Histogram({
      name: 'http_request_size_bytes',
      help: 'Size of HTTP requests in bytes',
      labelNames: ['method', 'route']
    });
    ```

- **Response Size**: Measures the size of HTTP responses in bytes. This helps in understanding the data being sent from the application.
    ```javascript
    const httpResponseSizeBytes = new promClient.Histogram({
      name: 'http_response_size_bytes',
      help: 'Size of HTTP responses in bytes',
      labelNames: ['method', 'route']
    });
    ```
## Adding Metric Panels to Grafana
1. Open Grafana and navigate to the dashboard where you want to add the metrics.
2. Click on "Add panel" to create a new panel.
3. Select "Prometheus" as the data source.
4. Add the following metrics to visualize the respective data:
    - **Request Duration**: `http_request_duration_seconds`
    - **Request Rate**: `http_requests_total`
    - **Error Rate**: `http_requests_total` with status code labels
    - **Response Size**: `http_response_size_bytes`
    - **CPU Usage**: `process_cpu_seconds_total`
    - **Memory Usage**: `process_resident_memory_bytes`
    - **Uptime**: `process_start_time_seconds`
5. Configure the visualization options as needed and save the panel.

This should help you set up and visualize the metrics in Grafana.    

## Redis Caching
I use Redis to cache data to improve the performance of our application. By caching frequently accessed data, we can reduce the load on our database and speed up response times.

### Example Usage
```javascript
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

// Example function to get data with caching
async function getData(key) {
  return new Promise((resolve, reject) => {
    client.get(key, (err, data) => {
      if (err) return reject(err);
      if (data) return resolve(JSON.parse(data));

      // Fetch data from database or other source
      const fetchedData = fetchDataFromSource(key);

      // Cache the data
      client.setex(key, 3600, JSON.stringify(fetchedData));

      resolve(fetchedData);
    });
  });
}
```

## API Endpoints
Here are the endpoints to test the API:

- **Fetch all posts**
    ```http
    http://localhost:3001/v1/posts
    ```
    Fetches all posts from the database.
     **Example Response:**
    ```json
    {
      "data": [
        {
          "slug": "how-to-learn-javascript-in-2024",
          "title": "How to Learn JavaScript in 2024",
          "content": "Content of the post...",
          "draft": false,
          "created_at": "2024-01-01T00:00:00Z",
          "updated_at": "2024-01-01T00:00:00Z",
          "category": "Programming",
          "author": "Jane Doe"
        }
      ],
      "metadata": {
        "count": 1,
        "limit": null,
        "offset": null
      }
    }
    ```

- **Fetch Posts by Category**
    ```http
    http://localhost:3001/v1/posts?category=Programming
    ```
    Fetches posts filtered by the specified category.

- **Fetch Posts by Author**
    ```http
    http://localhost:3001/v1/posts?author=Jane%20Doe
    ```
    Fetches posts written by the specified author.

- **Fetch a Single Post by Slug**
    ```http
    http://localhost:3001/v1/posts/how-to-learn-javascript-in-2024
    ```
    Fetches a single post identified by its slug.

- **Fetch a Draft Post**
    ```http
    http://localhost:3001/v1/posts/draft-post-example
    ```
    Fetches a draft post identified by its slug.

- **Fetch a Draft Post with includeDrafts=true**
    ```http
    http://localhost:3001/v1/posts/draft-post-example?includeDrafts=true
    ```
    Fetches a draft post identified by its slug, including drafts in the results.

- **Fetch Posts with Pagination and Sorting**
    ```http
    http://localhost:3001/v1/posts?limit=10&sort=created_at
    ```
    Fetches posts with pagination and sorting applied. The [`limit`](command:_github.copilot.openSymbolFromReferences?%5B%22limit%22%2C%5B%7B%22uri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22%2Fhome%2Fdavidtskhvedadze%2FCodesmith%20Repos%2Fsimple-api%2FREADME.md%22%2C%22external%22%3A%22file%3A%2F%2F%2Fhome%2Fdavidtskhvedadze%2FCodesmith%2520Repos%2Fsimple-api%2FREADME.md%22%2C%22path%22%3A%22%2Fhome%2Fdavidtskhvedadze%2FCodesmith%20Repos%2Fsimple-api%2FREADME.md%22%2C%22scheme%22%3A%22file%22%7D%2C%22pos%22%3A%7B%22line%22%3A189%2C%22character%22%3A35%7D%7D%5D%5D "Go to definition") parameter specifies the number of posts per page, and the [`sort`](command:_github.copilot.openSymbolFromReferences?%5B%22sort%22%2C%5B%7B%22uri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22%2Fhome%2Fdavidtskhvedadze%2FCodesmith%20Repos%2Fsimple-api%2FREADME.md%22%2C%22external%22%3A%22file%3A%2F%2F%2Fhome%2Fdavidtskhvedadze%2FCodesmith%2520Repos%2Fsimple-api%2FREADME.md%22%2C%22path%22%3A%22%2Fhome%2Fdavidtskhvedadze%2FCodesmith%20Repos%2Fsimple-api%2FREADME.md%22%2C%22scheme%22%3A%22file%22%7D%2C%22pos%22%3A%7B%22line%22%3A189%2C%22character%22%3A44%7D%7D%5D%5D "Go to definition") parameter specifies the sorting order.

- **Fetch Non-Existent Post**
    ```http
    http://localhost:3001/v1/posts/non-existent-slug
    ```
    Attempts to fetch a post that does not exist, useful for testing error handling.
    


## Extensibility
The use of middleware and modular route handling makes the API extensible. New features can be added with minimal changes to existing code. Middleware functions can be easily added or modified to handle new types of requests or to implement additional functionality. Similarly, new routes can be added in separate modules without affecting the existing routes.

## Tradeoffs Considered

1. **Database Choice**:
    - **PostgreSQL**: Chosen for its robustness, scalability, and support for complex queries.
    - **MongoDB**: Considered for its flexibility and ease of use with JSON-like documents, but avoided due to the need for complex relational queries.

2. **Caching Strategy**:
    - **Redis**: Chosen for its speed and support for various data structures.
    - **In-Memory Caching**: Considered for simplicity, but avoided due to scalability concerns.

3. **Metrics Collection**:
    - **Prometheus**: Chosen for its powerful querying capabilities and integration with Grafana.
    - **Custom Logging**: Considered for simplicity, but avoided due to lack of standardization and visualization capabilities.

4. **API Framework**:
    - **Express.js**: Chosen for its simplicity, flexibility, and large ecosystem.
    - **Koa.js**: Considered for its modern design and async/await support, but avoided due to smaller community and ecosystem.

### Paths Avoided

1. **Using a NoSQL Database**:
    - Avoided due to the need for complex relational queries and transactions which are better supported by PostgreSQL.

2. **In-Memory Caching**:
    - Avoided due to scalability concerns and the need for a distributed caching solution provided by Redis.

3. **Custom Metrics Collection**:
    - Avoided due to the lack of standardization and visualization capabilities compared to Prometheus and Grafana.

4. **Using a Different API Framework**:
    - Avoided Koa.js and other frameworks due to the larger ecosystem and community support available for Express.js.

By considering these tradeoffs and making informed decisions, I aimed to build a robust, scalable, and maintainable application.

