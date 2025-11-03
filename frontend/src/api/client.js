import axios from "axios";

// Add a small timeout so the UI doesn't hang indefinitely if the backend is down
const api = axios.create({
	baseURL: "http://localhost:5000/api",
	timeout: 5000,
});

export default api;
