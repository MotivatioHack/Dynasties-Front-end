// Dynasty files mapping
const dynastyFiles = {
    'gurjara-pratihara': 'data/gurjara-pratihara.json',
    'chola': 'data/chola.json',
    'hoysala': 'data/hoysala.json',
    'delhi': 'data/delhi.json',
    'bahmani': 'data/bahmani.json',
    'vijayanagara': 'data/vijayanagara.json',
    'mughal': 'data/mughal.json',
    'maratha': 'data/maratha.json',
    'sikh': 'data/sikh.json',
    'british': 'data/british.json'
};

// Array of videos for the "Rulers of India" section
const rulerVideos = [
    "data/har-har-mahadev.mp4",
    "data/expansion2.mp4",
    "data/chhava2.mp4",
    "data/Expansion.mp4",
    "data/chhava3.mp4"
];

// Durations for each video (in seconds)
const videoDurations = [16, 19, 17, 15, 15];

// Playback speeds for each video (set to default speed of 1.0)
const playbackSpeeds = [1.0, 1.0, 1.0, 1.0, 1.0];

// Function to rotate videos using dual-video cross-fade
let currentVideoIndex = 0;
let activeVideo = document.getElementById('video1');
let inactiveVideo = document.getElementById('video2');
let availableVideos = [...rulerVideos];
let availableDurations = [...videoDurations];
let availableSpeeds = [...playbackSpeeds];

function rotateHeroVideo() {
    if (!activeVideo || !inactiveVideo) {
        console.error("Video elements not found.");
        return;
    }

    if (availableVideos.length === 0) {
        const videoFallback = document.querySelector('.video-fallback');
        if (videoFallback) {
            videoFallback.style.display = 'block';
        }
        return;
    }

    currentVideoIndex = (currentVideoIndex + 1) % availableVideos.length;
    const nextVideoSrc = availableVideos[currentVideoIndex];

    console.log(`Attempting to play video ${currentVideoIndex + 1}/${availableVideos.length}: ${nextVideoSrc}`);

    const temp = activeVideo;
    activeVideo = inactiveVideo;
    inactiveVideo = temp;

    const inactiveSource = inactiveVideo.querySelector('source');
    if (inactiveSource) {
        inactiveSource.src = nextVideoSrc;
        inactiveVideo.load();
        inactiveVideo.playbackRate = availableSpeeds[currentVideoIndex];

        inactiveVideo.play().then(() => {
            console.log(`Successfully playing video: ${nextVideoSrc}`);
        }).catch(error => {
            console.error(`Failed to play video ${nextVideoSrc}:`, error.message);
            const failedIndex = availableVideos.indexOf(nextVideoSrc);
            if (failedIndex !== -1) {
                availableVideos.splice(failedIndex, 1);
                availableDurations.splice(failedIndex, 1);
                availableSpeeds.splice(failedIndex, 1);
                if (currentVideoIndex >= availableVideos.length) {
                    currentVideoIndex = 0;
                }
            }
            rotateHeroVideo();
        });

        activeVideo.classList.remove('active');
        inactiveVideo.classList.add('active');

        if (currentVideoIndex === 0) {
            inactiveVideo.currentTime = 10;
        } else {
            inactiveVideo.currentTime = 0;
        }

        const duration = availableDurations[currentVideoIndex] * 1000;
        setTimeout(rotateHeroVideo, duration);
    } else {
        console.error("Source element not found in inactive video.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!activeVideo || !inactiveVideo) {
        console.error("Video elements not found on DOM load.");
        return;
    }

    // Start with the first video
    const activeSource = activeVideo.querySelector('source');
    if (activeSource) {
        activeSource.src = availableVideos[0];
        activeVideo.load();
        activeVideo.playbackRate = availableSpeeds[0];
        activeVideo.classList.add('active');
        activeVideo.currentTime = 10;
        activeVideo.play().then(() => {
            console.log(`Successfully playing initial video: ${availableVideos[0]}`);
        }).catch(error => {
            console.error('Initial video play failed:', error.message);
            availableVideos.splice(0, 1);
            availableDurations.splice(0, 1);
            availableSpeeds.splice(0, 1);
            currentVideoIndex = -1;
            rotateHeroVideo();
        });
        setTimeout(rotateHeroVideo, availableDurations[0] * 1000);
    } else {
        console.error("Source element not found in active video.");
    }

    // Add smooth scrolling for navbar and footer links
    document.querySelectorAll('.nav-links a, .footer-column ul li a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// Function to open the modal with dynasty information
function openModal(dynasty) {
    const modal = document.getElementById("dynastyModal");
    const modalInfo = document.getElementById("modal-info");
    const videoIframe = document.getElementById("modal-dynasty-video");

    if (!modal || !modalInfo || !videoIframe) {
        console.error("Modal elements not found.");
        return;
    }

    if (dynastyFiles[dynasty]) {
        modalInfo.innerHTML = "<p>Loading...</p>";
        videoIframe.style.display = "none";
        fetch(dynastyFiles[dynasty])
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load ${dynasty} data: ${response.status}`);
                return response.json();
            })
            .then(data => {
                renderAllSections(data, videoIframe);
                modal.style.display = "block";
                modalInfo.focus();
            })
            .catch(error => {
                console.error(`Error loading ${dynasty} data:`, error);
                modalInfo.innerHTML = `<p>Error loading dynasty information: ${error.message}. Please try again later.</p>`;
                modal.style.display = "block";
            });
    } else {
        modalInfo.innerHTML = "<p>Dynasty information not found.</p>";
        modal.style.display = "block";
    }
}

function renderAllSections(data, videoIframe) {
    const modalInfo = document.getElementById("modal-info");

    if (!modalInfo) {
        console.error("Modal info element not found.");
        return;
    }

    const sectionsHTML = data.sections.map(section => {
        let contentHTML = Array.isArray(section.content)
            ? section.content.map(paragraph => `<p>${paragraph}</p>`).join("")
            : `<p>${section.content}</p>`;
        return `
            <section>
                <h3>${section.title}</h3>
                <div style="text-align:center; margin-bottom: 20px;">
                    <img src="${section.image}" alt="${section.title}" 
                        style="max-width:50%; height:auto; border-radius:10px; box-shadow:0 4px 8px rgba(0,0,0,0.2);">
                </div>
                ${contentHTML}
            </section>
            <hr>
        `;
    }).join("");

    if (data.video) {
        videoIframe.src = data.video;
        videoIframe.style.display = "block";
    } else {
        videoIframe.src = "";
        videoIframe.style.display = "none";
        console.warn(`No video URL found for ${data.name}`);
    }

    let info = `
        <h2 id="modal-title">${data.name} (${data.period})</h2>
        <p><strong>Founder:</strong> ${data.founder}</p>
        <p><strong>Capital:</strong> ${data.capital}</p>
        <hr>
        <div style="text-align:center; margin-bottom: 20px;">
            <img src="${data.image}" alt="${data.name} Map" 
                style="max-width:50%; height:auto; border-radius:10px; box-shadow:0 4px 8px rgba(0,0,0,0.2);">
        </div>
        ${sectionsHTML}
    `;

    modalInfo.innerHTML = info.replace(/<hr>$/, '');
}

function closeModal() {
    const modal = document.getElementById("dynastyModal");
    const videoIframe = document.getElementById("modal-dynasty-video");

    if (modal && videoIframe) {
        modal.style.display = "none";
        videoIframe.src = "";
    } else {
        console.error("Modal or video iframe not found.");
    }
}

document.addEventListener('click', function (event) {
    const modal = document.getElementById("dynastyModal");
    if (event.target === modal) {
        closeModal();
    }
});

function openLogin() {
    window.open("login.html", "_blank");
}

// Function to toggle between login and register forms
function toggleForm(formType) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginFeedback = document.getElementById('loginFeedback');
    const registerFeedback = document.getElementById('registerFeedback');

    if (loginForm && registerForm && loginFeedback && registerFeedback) {
        if (formType === 'register') {
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
            loginFeedback.innerHTML = '';
            document.getElementById('username').value = '';
            document.getElementById('email').value = '';
            document.getElementById('phone').value = '';
            document.getElementById('password').value = '';
            document.getElementById('passwordStrength').innerHTML = '';
        } else {
            registerForm.classList.remove('active');
            loginForm.classList.add('active');
            registerFeedback.innerHTML = '';
            document.getElementById('reg-username').value = '';
            document.getElementById('reg-email').value = '';
            document.getElementById('reg-phone').value = '';
            document.getElementById('reg-password').value = '';
            document.getElementById('regPasswordStrength').innerHTML = '';
        }
        document.querySelectorAll('.input-box').forEach(box => {
            box.classList.remove('error');
            box.removeAttribute('data-error');
        });
    }
}

// Function to validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to validate phone number (10 digits)
function validatePhone(phone) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
}

// Function to validate username (alphanumeric, 3-20 characters)
function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    return usernameRegex.test(username);
}

// Function to handle registration
function handleRegister(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('reg-username');
    const emailInput = document.getElementById('reg-email');
    const phoneInput = document.getElementById('reg-phone');
    const passwordInput = document.getElementById('reg-password');
    const feedback = document.getElementById('registerFeedback');
    const submitButton = document.querySelector('#registerForm .btn');

    if (!usernameInput || !emailInput || !phoneInput || !passwordInput || !feedback) {
        console.error("Register form elements not found.");
        return;
    }

    // Reset previous error states
    document.querySelectorAll('#registerForm .input-box').forEach(box => {
        box.classList.remove('error');
        box.removeAttribute('data-error');
    });
    feedback.innerHTML = "";

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;

    let isValid = true;

    // Validate username
    if (!validateUsername(username)) {
        usernameInput.parentElement.classList.add('error');
        usernameInput.parentElement.setAttribute('data-error', 'Username must be 3-20 alphanumeric characters.');
        isValid = false;
    }

    // Validate email
    if (!validateEmail(email)) {
        emailInput.parentElement.classList.add('error');
        emailInput.parentElement.setAttribute('data-error', 'Please enter a valid email address.');
        isValid = false;
    }

    // Validate phone
    if (!validatePhone(phone)) {
        phoneInput.parentElement.classList.add('error');
        phoneInput.parentElement.setAttribute('data-error', 'Phone number must be 10 digits.');
        isValid = false;
    }

    // Validate password (minimum 6 characters)
    if (password.length < 6) {
        passwordInput.parentElement.classList.add('error');
        passwordInput.parentElement.setAttribute('data-error', 'Password must be at least 6 characters.');
        isValid = false;
    }

    if (!isValid) {
        feedback.innerHTML = "<p style='color: red;'>Please fix the errors above.</p>";
        return;
    }

    // Check if username or email already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.username === username || user.email === email);

    if (userExists) {
        feedback.innerHTML = "<p style='color: red;'>Username or email already exists.</p>";
        return;
    }

    // Disable the button and show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = "Registering...";

    // Simulate backend registration
    setTimeout(() => {
        // Store user data in localStorage
        users.push({ username, email, phone, password });
        localStorage.setItem('users', JSON.stringify(users));

        feedback.innerHTML = "<p style='color: green;'>Registration successful! Please login.</p>";
        submitButton.disabled = false;
        submitButton.innerHTML = "Register";

        // Automatically switch to login form after 1 second
        setTimeout(() => {
            toggleForm('login');
        }, 1000);
    }, 1000); // Simulate network delay
}

// Function to handle login
function handleLogin(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const feedback = document.getElementById('loginFeedback');
    const submitButton = document.querySelector('#loginForm .btn');

    if (!usernameInput || !emailInput || !phoneInput || !passwordInput || !feedback) {
        console.error("Login form elements not found.");
        return;
    }

    // Reset previous error states
    document.querySelectorAll('#loginForm .input-box').forEach(box => {
        box.classList.remove('error');
        box.removeAttribute('data-error');
    });
    feedback.innerHTML = "";

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;

    let isValid = true;

    // Validate username
    if (!validateUsername(username)) {
        usernameInput.parentElement.classList.add('error');
        usernameInput.parentElement.setAttribute('data-error', 'Username must be 3-20 alphanumeric characters.');
        isValid = false;
    }

    // Validate email
    if (!validateEmail(email)) {
        emailInput.parentElement.classList.add('error');
        emailInput.parentElement.setAttribute('data-error', 'Please enter a valid email address.');
        isValid = false;
    }

    // Validate phone
    if (!validatePhone(phone)) {
        phoneInput.parentElement.classList.add('error');
        phoneInput.parentElement.setAttribute('data-error', 'Phone number must be 10 digits.');
        isValid = false;
    }

    // Validate password (minimum 6 characters)
    if (password.length < 6) {
        passwordInput.parentElement.classList.add('error');
        passwordInput.parentElement.setAttribute('data-error', 'Password must be at least 6 characters.');
        isValid = false;
    }

    if (!isValid) {
        feedback.innerHTML = "<p style='color: red;'>Please fix the errors above.</p>";
        return;
    }

    // Disable the button and show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = "Logging in...";

    // Check credentials against localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username && user.password === password);

    setTimeout(() => {
        if (user) {
            feedback.innerHTML = "<p style='color: green;'>Login successful!</p>";
            // Redirect to index.html after successful login
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        } else {
            feedback.innerHTML = "<p style='color: red;'>Invalid username or password.</p>";
        }
        submitButton.disabled = false;
        submitButton.innerHTML = "Login";
    }, 1000); // Simulate network delay
}

// Password strength indicator for login form
const passwordInput = document.getElementById('password');
if (passwordInput) {
    passwordInput.addEventListener('input', function () {
        const password = this.value;
        const strengthIndicator = document.getElementById('passwordStrength');
        if (!strengthIndicator) return;

        let strength = '';

        if (password.length < 6) {
            strength = 'Too short';
            strengthIndicator.style.color = 'red';
        } else if (password.length < 10) {
            strength = 'Weak';
            strengthIndicator.style.color = 'orange';
        } else if (password.match(/[A-Z]/) && password.match(/[0-9]/)) {
            strength = 'Strong';
            strengthIndicator.style.color = 'green';
        } else {
            strength = 'Moderate';
            strengthIndicator.style.color = 'yellow';
        }

        strengthIndicator.innerHTML = `Password Strength: ${strength}`;
    });
}

// Password strength indicator for register form
const regPasswordInput = document.getElementById('reg-password');
if (regPasswordInput) {
    regPasswordInput.addEventListener('input', function () {
        const password = this.value;
        const strengthIndicator = document.getElementById('regPasswordStrength');
        if (!strengthIndicator) return;

        let strength = '';

        if (password.length < 6) {
            strength = 'Too short';
            strengthIndicator.style.color = 'red';
        } else if (password.length < 10) {
            strength = 'Weak';
            strengthIndicator.style.color = 'orange';
        } else if (password.match(/[A-Z]/) && password.match(/[0-9]/)) {
            strength = 'Strong';
            strengthIndicator.style.color = 'green';
        } else {
            strength = 'Moderate';
            strengthIndicator.style.color = 'yellow';
        }

        strengthIndicator.innerHTML = `Password Strength: ${strength}`;
    });
}




