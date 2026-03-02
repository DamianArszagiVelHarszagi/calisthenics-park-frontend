fetch("https://web2-course-project-back-end-6vm7.onrender.com/api/parks")
	.then((res) => res.json())
	.then((data) => console.log("API response:", data))
	.catch((err) => console.error("Failed to connect:", err));
