let l = document.getElementById('login');
let r = document.getElementById('register');
let toggle = document.getElementById('btn');

function showErrorMessage(error) {
    if (error.response && error.response.data.message) {
        document.getElementById('err').textContent = `${error.response.data.message}`;
    } else {
        document.getElementById('err').textContent = 'Something went wrong! Please try again.';
    }
    document.addEventListener('click', () => document.getElementById('err').textContent = "", { once: true });
}

function login() {
    r.style.display = "none";
    l.style.display = "block"
    toggle.style.left = "0";
}

function register() {
    l.style.display = "none";
    r.style.display = "block";
    toggle.style.left = "110px";
}

async function loginUser(e) {
    e.preventDefault();
    try {
        const loginDetails = {
            email: e.target.email.value,
            password: e.target.password.value
        }
        const response = await axios.post('/user/login', loginDetails);
        if (response.status === 200) {
            alert(response.data.message);
            localStorage.setItem('token', response.data.token);
            window.location.href = "../expense/home.html";
        }
    }
    catch (error) {
        showErrorMessage(error);
    }
}

async function registerUser(e) {
    e.preventDefault();
    try {
        const signupDetails = {
            name: e.target.name.value,
            email: e.target.email.value,
            password: e.target.password.value
        }
        const response = await axios.post('/user/signup', signupDetails);
        if (response.status === 201) {
            alert(response.data.message);
            localStorage.setItem('token', response.data.token);
            window.location.href = "../expense/home.html";
        }

    } catch (error) {
        showErrorMessage(error);
    }
}

async function forgotPassword(e) {
    e.preventDefault();
    try {
        const forgotEmail = {
            email: e.target.email.value
        }
        const response = await axios.post('/password/forgotpassword', forgotEmail);
        alert(response.data.message);
        e.target.email.value = "";
    } catch (error) {
        showErrorMessage(error);
    }
}

async function resetPassword(e) {
    e.preventDefault();
    try {
        const newpassword = e.target.newpassword.value;
        const passwordcheck = e.target.passwordcheck.value;
        const id = getCookie('id');
        if (newpassword !== passwordcheck) {
            return document.getElementById('err').textContent = "Passwords don't match! Please try again.";
        }
        const details = {
            newpassword: newpassword
        }
        const response = await axios.post(`/password/updatepassword/${id}`, details);
        alert("Password updated succesfully. Please login with the new password");
        window.location.href = "login.html"
    } 
    catch (error) {
        showErrorMessage(error);
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts[1].split(';')[0];
}