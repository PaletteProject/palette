import {Rubric} from "./types/rubric.ts";

// define the backed endpoints
const backendBaseURL: string= "http://localhost:3000/api/rubrics";
const BAD_REQUEST = 400;

// function to send rubric to the server
export async function postRubric(rubric: Rubric) {
    try {
        const res = await fetch(backendBaseURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(rubric),
        });

        if (res.ok) {
            const data = await res.json();
            console.log("Rubric saved!", data);
        } else {
            const errorResult = await res.json();
            if (res.status === BAD_REQUEST) {
                // Display validation errors
                const errors = errorResult.errors;
                errors.forEach((error: { param: any; msg: any }) => {
                    console.log(`Field: ${error.param}, Message: ${error.msg}`);
                });
            } else {
                // Handle other errors
                console.error("An error occurred:", errorResult.error);
            }
        }
    } catch (error) {
        console.error(error); // update error message with more deets
    }
}
