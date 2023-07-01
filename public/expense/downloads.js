function showErrorMessage(error) {
    if (error.response && error.response.data.message) {
        document.getElementById('err').textContent = `${error.response.data.message}`;
    } else {
        document.getElementById('err').textContent = 'Something went wrong!';
    }
    document.addEventListener('click', () => document.getElementById('err').textContent = "", { once: true });
}

document.addEventListener("DOMContentLoaded", ()=>{
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = "../login/login.html";
    }
})

document.getElementById('logout').onclick = () => {
    localStorage.clear();
    window.location.href = "../login/login.html";
}

async function downloadExpenses() {
    event.preventDefault();
    try {
        const token = localStorage.getItem('token');
        const d1 = new Date(document.getElementById("start-date").value);
        const d2 = new Date(document.getElementById("end-date").value);
        let startDate = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).toISOString();
        let endDate = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate() + 1).toISOString();
        const response = await axios.get(`/premium/download?startDate=${startDate}&endDate=${endDate}`, { headers: { "Authorization": token } });
        const a = document.createElement('a');
        a.href = response.data.fileURL;
        a.download = 'myexpense.csv';
        a.click();
    }
    catch (error) {
        showErrorMessage(error);
    }
}