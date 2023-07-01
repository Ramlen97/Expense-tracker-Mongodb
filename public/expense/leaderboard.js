function showErrorMessage(error) {
    if (error.response && error.response.data.message) {
        document.getElementById('err').textContent = `${error.response.data.message}`;
    } else {
        document.getElementById('err').textContent = 'Something went wrong!';
    }
    document.addEventListener('click', () => document.getElementById('err').textContent= "", { once: true });
}

document.addEventListener('DOMContentLoaded', async()=>{
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = "../login/login.html";
        }
        const response = await axios.get(`/premium/leaderboard`, { headers: { "Authorization": token } });
        const leaderboard = document.getElementById('leaderboard-list');
        let rank=1;
        for (user of response.data) {
            leaderboard.innerHTML += `<tr>
                <td>${rank}</td>
                <td>${user.name}</td>
                <td>${user.totalExpense}</td>
            </tr>`
            rank++;
        }
    }
    catch (error) {
        showErrorMessage(error);
    }
})

document.getElementById('logout').onclick = () => {
    localStorage.clear();
    window.location.href = "../login/login.html";
}