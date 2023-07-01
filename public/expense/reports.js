let currentPage = 1;
let rowsPerPage = localStorage.getItem('rowsPerPage') ? localStorage.getItem('rowsPerPage') : 10;
let totalCount = 0;
let totalExpense = 0;
let table = document.getElementById('expense-table');
let d = new Date();
let startDate;
let endDate;
let toggle = document.getElementById('btn');
let period = "daily";

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function showErrorMessage(error) {
    if (error.response && error.response.data.message) {
        document.getElementById('err').textContent = `${error.response.data.message}`;
    } else {
        document.getElementById('err').textContent = 'Something went wrong!';
    }
    removeErrorMessage();
}

function removeErrorMessage() {
    document.addEventListener('click', () => document.getElementById('err').textContent = "", { once: true });
}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = "../login/login.html";
    }
    if (parseJwt(token).isPremium) {
        showPremiumUser();
    }
    daily();
})

function showPremiumUser() {
    document.getElementById('rzp-button').textContent = "Premium User";
    document.getElementById('nav-menu').innerHTML +=
        `<li><a href='leaderboard.html'>Leaderboard</a></li>
    <li><a href='downloads.html'>Downloads</a></li>`;
}

async function getExpenses() {
    try {
        startDateString = startDate.toISOString();
        endDateString = endDate.toISOString();
        // console.log(startDate,endDate);
        const token = localStorage.getItem('token');
        const response = await axios.get(`/expense?page=${currentPage}&rows=${rowsPerPage}&startDate=${startDateString}&endDate=${endDateString}`, { headers: { "Authorization": token } });
        const [expenses, [{ count, total }]] = response.data;
        totalCount = count
        totalExpense = total
        pagination();
        document.getElementById('expense-items').innerHTML = "";
        if (expenses.length > 0) {
            for (let i = expenses.length - 1; i >= 0; i--) {
                showExpenseOnScreen(expenses[i]);
            }
        }
    } catch (error) {
        console.log(error);
        showErrorMessage(error);
    }
}

function showExpenseOnScreen(exp) {
    const list = document.getElementById('expense-items');
    const d = new Date(exp.createdAt);
    const expense = `<tr id="${exp.id}" >
        <td>${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}</td>
        <td>${exp.category}</td>
        <td>${exp.description}</td>
        <td>${exp.amount}</td>
    </tr>`
    list.insertAdjacentHTML("afterbegin", expense);
}

document.getElementById('rzp-button').onclick = async (e) => {
    try {
        const token = localStorage.getItem('token');
        if (parseJwt(token).isPremium) {
            alert("You are already a premium user");
            return;
        }
        const response = await axios.get(`/purchase/premiummembership`, { headers: { "Authorization": token } });
        const options = {
            key: response.data.key_id,
            order_id: response.data.order.id,
            handler: async (response) => {
                result = await axios.post(`/purchase/updatetransaction`, {
                    status: "successful",
                    order_id: options.order_id,
                    payment_id: response.razorpay_payment_id
                }, { headers: { "Authorization": token } });

                alert('You are a Premium User Now');
                localStorage.setItem('token', result.data.token);
                showPremiumUser();
            }
        }
        const rzp1 = new Razorpay(options);
        rzp1.open();
        e.preventDefault();

        rzp1.on('payment.failed', (response) => {
            // console.log('payment failed', response.error.metadata.payment_id);
            alert('Something went wrong');
            axios.post(`/purchase/updatetransaction`, {
                status: "failed",
                order_id: response.error.metadata.order_id,
                payment_id: response.error.metadata.payment_id
            }, { headers: { "Authorization": token } });
        });
    }
    catch (error) {
        showErrorMessage(error);
    }
}

document.getElementById('logout').onclick = () => {
    localStorage.clear();
    window.location.href = "../login/login.html";
}

async function daily() {
    period = "daily";
    toggle.style.left = "0";
    startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    document.getElementById("period-input").removeAttribute('readonly');
    document.getElementById("period-input").type = "date";
    document.getElementById("period-input").value = `${startDate.toLocaleDateString("en-CA")}`;
    await getExpenses();
    document.getElementById("total-expense").textContent = `Total=${totalExpense}`;
}

async function monthly() {
    period = "monthly";
    toggle.style.left = "250px";
    startDate = new Date(d.getFullYear(), d.getMonth());
    endDate = new Date(d.getFullYear(), d.getMonth() + 1);
    document.getElementById("period-input").removeAttribute('readonly');
    document.getElementById("period-input").type = "month";
    document.getElementById("period-input").value = `${startDate.toLocaleDateString("en-CA").slice(0, 7)}`;
    await getExpenses();
    document.getElementById("total-expense").textContent = `Total=${totalExpense}`;
}

async function yearly() {
    period = "yearly";
    toggle.style.left = "500px";
    startDate = new Date(d.getFullYear(), 0);
    endDate = new Date(d.getFullYear() + 1, 0)
    document.getElementById("period-input").readOnly = "true";
    document.getElementById("period-input").type = "number";
    document.getElementById("period-input").value = `${startDate.getFullYear()}`;
    await getExpenses();
    document.getElementById("total-expense").textContent = `Total=${totalExpense}`;
}

async function previousPeriod() {
    if (period === "daily") {
        startDate.setDate(startDate.getDate() - 1);
        endDate.setDate(endDate.getDate() - 1);
        document.getElementById("period-input").value = `${startDate.toLocaleDateString("en-CA")}`;
    }
    else if (period === "monthly") {
        startDate.setMonth(startDate.getMonth() - 1);
        endDate.setMonth(endDate.getMonth() - 1);
        document.getElementById("period-input").value = `${startDate.toLocaleDateString("en-CA").slice(0, 7)}`;
    }
    else {
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate.setFullYear(endDate.getFullYear() - 1);
        document.getElementById("period-input").value = `${startDate.getFullYear()}`;

    }
    await getExpenses();
    document.getElementById("total-expense").textContent = `Total=${totalExpense}`;
}

async function nextPeriod() {
    if (period === "daily") {
        startDate.setDate(startDate.getDate() + 1);
        endDate.setDate(endDate.getDate() + 1);
        document.getElementById("period-input").value = `${startDate.toLocaleDateString("en-CA")}`;
    }
    else if (period === "monthly") {
        startDate.setMonth(startDate.getMonth() + 1);
        endDate.setMonth(endDate.getMonth() + 1);
        document.getElementById("period-input").value = `${startDate.toLocaleDateString("en-CA").slice(0, 7)}`;
    }
    else {
        startDate.setFullYear(startDate.getFullYear() + 1);
        endDate.setFullYear(endDate.getFullYear() + 1);
        document.getElementById("period-input").value = `${startDate.getFullYear()}`;
    }
    await getExpenses();
    document.getElementById("total-expense").textContent = `Total=${totalExpense}`;
}

async function changePeriod(e) {
    let d = new Date(e.target.value)
    if (period === 'daily') {
        startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    }
    else if (period === "monthly") {
        startDate = new Date(d.getFullYear(), d.getMonth());
        endDate = new Date(d.getFullYear(), d.getMonth() + 1);
    }
    await getExpenses();
    document.getElementById("total-expense").textContent = `Total=${totalExpense}`;
}

function pagination() {
    maxPages = Math.ceil(totalCount / rowsPerPage);
    document.getElementById('prev-btn').style.display = currentPage > 1 ? "block" : "none";
    document.getElementById('next-btn').style.display = maxPages > currentPage ? "block" : "none";
    const list = document.getElementById('page-list');
    list.innerHTML = "";
    if (maxPages > 1) {
        for (let i = 1; i <= maxPages; i++) {
            if (currentPage == i) {
                list.innerHTML += `<li class="active-page" onclick="gotoPage(${i})" >${i}</li>`;
            } else {
                list.innerHTML += `<li onclick="gotoPage(${i})" >${i}</li>`;
            }
        }
    }
    document.getElementById('rows-per-page').value = rowsPerPage;
    const previousExpenseCount = (currentPage - 1) * rowsPerPage;
    const start = previousExpenseCount + 1;
    const temp = previousExpenseCount + Number(rowsPerPage);
    const end = temp < totalCount ? temp : totalCount;
    if (totalCount > 0) {
        document.getElementById('page-details').textContent = `Showing ${start}-${end} of ${totalCount}`;
    } else {
        document.getElementById('page-details').textContent = "";
    }
}

function showPreviousPage() {
    currentPage--;
    getExpenses();
}

function showNextPage() {
    currentPage++;
    getExpenses();
}

function gotoPage(pageNo) {
    currentPage = pageNo;
    getExpenses();
}

function updatedRows() {
    rowsPerPage = event.target.value;
    localStorage.setItem('rowsPerPage', rowsPerPage);
    getExpenses();
}