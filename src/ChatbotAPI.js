import axios from "axios";
// import fetch  from 'node-fetch';
async function moodGuesser(message) {
	// const response = axios
	// 	.post("http://127.0.0.1:8000/mood",

	// 		 message

	// 		// Headers: {
	// 		// 	"Access-Control-Allow-Origin": "*",

	// 		// 	"Access-Control-Allow-Headers":
	// 		// 	"Origin, X-Requested-With, Content-Type, Accept",
	// 		// 	"Content-Type": "application/json",
	// 		// },
	// 	)
	// 	.then(function (response) {
	// 		// handle success
	// 		console.log(response.data);
	// 	})
	// 	.catch(function (error) {
	// 		// handle error
	// 		console.log(error);
	// 	})
	// 	.then(function () {
	// 		// always executed
	// 	});

	// const options = {
	// 	url: "http://127.0.0.1:8000/mood",
	// 	method: "POST",
	// 	headers: {
	// 		Accept: "application/json",
	// 		"Content-Type": "application/json;charset=UTF-8",
	// 	},
	// 	data: {
	// 		input_mood: "I am not feeling good",
	// 	},
	// };

	// const response = axios(options).then((response) => {
	// 	console.log(response.status);
	// });

	const apiBase = process.env.REACT_APP_API_URL || ""; // leave empty for same-origin
	const url = `${apiBase}/mood?input_mood=${encodeURIComponent(message)}`;
	try {
		const res = await axios.post(url);
		return res.data;
	} catch (err) {
		console.error("ChatbotAPI moodGuesser error:", err);
		return null;
	}
}

const API = {

	GetChatbotResponse: async (message) => {
		if (!message) return "";
		if (message === "hi" || message === "hello" || message === "hey")
			return "Here I am your Moody bot! I can analyse your mood as you write.";
		const data = await moodGuesser(message);
		if (data && data.Analytics_of_Prediction) return data.Analytics_of_Prediction;
		return "Sorry, I couldn't reach the mood API.";
	},
};

export default API;
