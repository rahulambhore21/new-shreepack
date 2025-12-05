document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".quote-form");

    form.addEventListener("submit", async function (e) {
        e.preventDefault(); // stop form for validation

        const name = form.querySelector('input[placeholder="Name"]');
        const email = form.querySelector('input[placeholder="Email"]');
        const movingTo = form.querySelector('input[placeholder="Moving To"]');
        const movingFrom = form.querySelector('input[placeholder="Moving From"]');
        const mobile = form.querySelector('input[placeholder="Mobile No"]');
        const message = form.querySelector("textarea");

        let isValid = true;

        // Reset all error borders
        [name, email, movingTo, movingFrom, mobile, message].forEach(field => {
            field.style.borderColor = "#ccc";
        });

        // Name validation
        if (name.value.trim().length < 3) {
            isValid = false;
            name.style.borderColor = "red";
        }

        // Email validation (simple regex)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
            isValid = false;
            email.style.borderColor = "red";
        }

        // Moving To
        if (movingTo.value.trim().length < 2) {
            isValid = false;
            movingTo.style.borderColor = "red";
        }

        // Moving From
        if (movingFrom.value.trim().length < 2) {
            isValid = false;
            movingFrom.style.borderColor = "red";
        }

        // Mobile validation (10 digits)
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(mobile.value.trim())) {
            isValid = false;
            mobile.style.borderColor = "red";
        }

        // Message
        if (message.value.trim().length < 5) {
            isValid = false;
            message.style.borderColor = "red";
        }

        // Final check
        if (isValid) {
            const formData = {
                name: name.value.trim(),
                email: email.value.trim(),
                mobile: mobile.value.trim(),
                movingFrom: movingFrom.value.trim(),
                movingTo: movingTo.value.trim(),
                message: message.value.trim()
            };

            try {
                const response = await fetch('https://shreepackways-smtp.vercel.app/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                
                if (response.ok) {
                    alert('Thank you! Your message has been sent.');
                    form.reset(); // Clear form
                } else {
                    alert('Error sending message. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Network error. Please try again.');
            }
        } else {
            alert("Please fill all fields correctly.");
        }
    });
});