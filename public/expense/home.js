let currentPage = 1;
let rowsPerPage = 10;
let totalCount = 0;
let table = document.getElementById('expense-table');
let d = new Date();
let startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
let endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function showErrorMessage(error) {
    console.log(error);
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

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = "../login/login.html";
        }
        if (parseJwt(token).isPremium) {
            showPremiumUser();
        }
        await getExpenses();
    } catch (error) {
        showErrorMessage(error);
    }

});

function showPremiumUser() {
    document.getElementById('rzp-button').textContent = "Premium User";
    document.getElementById('nav-menu').innerHTML +=
        `<li><a href='leaderboard.html'>Leaderboard</a></li>
    <li><a href='downloads.html'>Downloads</a></li>`;
}

async function getExpenses() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/expense?page=${currentPage}&rows=${rowsPerPage}&startDate=${startDate}&endDate=${endDate}`, { headers: { "Authorization": token } });
        const [expenses, [{ count }]] = response.data;
        totalCount = count;
        pagination();
        document.getElementById('expense-items').innerHTML = "";
        if (expenses.length > 0) {
            for (let i = expenses.length - 1; i >= 0; i--) {
                showExpenseOnScreen(expenses[i]);
            }
        }
    } catch (error) {
        showErrorMessage(error);
    }
}

function showExpenseOnScreen(exp) {
    const list = document.getElementById('expense-items');
    const d = new Date(exp.createdAt);
    const expense = `<tr id="${exp._id}" >
        <td>${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}</td>
        <td>${exp.category}</td>
        <td>${exp.description}</td>
        <td>${exp.amount}</td>
        <td>
            <button onclick="deleteExpense('${exp._id}')">Delete</button>
            <button onclick="editExpense('${exp._id}','${exp.amount}','${exp.description}','${exp.category}')">Edit</button>
        </td>
    </tr>`
    list.insertAdjacentHTML("afterbegin", expense);
}

document.getElementById('rzp-button').onclick = async (e) => {
    try {
        const token = localStorage.getItem('token');
        if (parseJwt(token).isPremium) {
            return alert("You are already a premium user");
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

async function storeAndShowExpense(e) {
    e.preventDefault();
    const id = e.target.id.value;
    const amount = e.target.amount.value;
    const description = e.target.description.value;
    const category = e.target.category.value;
    if (!amount || !description || !category) {
        document.getElementById('err').textContent = "Please fill all the fields to add an expense!";
        removeErrorMessage();
        return
    }

    try {
        const token = localStorage.getItem('token');
        if (id === "null") {
            const exp = await axios.post(`/expense/add-expense`, {amount,description,category}, { headers: { "Authorization": token } });
            totalCount++;
            if (currentPage == 1) {
                if (table.rows.length > rowsPerPage) {
                    document.getElementById('expense-items').lastElementChild.remove();
                    if (totalCount % rowsPerPage === 1) {
                        pagination();
                    }
                }
                showExpenseOnScreen(exp.data);
            } else {
                currentPage = 1;
                getExpenses();
            }

        } else {
            document.getElementById('submit-btn').textContent = "Add Expense";
            document.getElementById(id).lastElementChild.style.display = "block";
            e.target.id.value = "null";

            const exp = await axios.post(`/expense/update-expense`, {id,amount,description,category}, { headers: { "Authorization": token } });

            const collection = document.getElementById(id).children;
            collection[1].textContent = category;
            collection[2].textContent = description;
            collection[3].textContent = amount;
            collection[4].innerHTML = `<button  onclick="deleteExpense('${id}')">Delete</button>
            <button  onclick="editExpense('${id}','${amount}','${description}','${category}')">Edit</button>`
        }

        e.target.amount.value = "";
        e.target.description.value = "";
    }
    catch (error) {
        showErrorMessage(error);
    }
}

async function deleteExpense(id) {
    try {
        const token = localStorage.getItem('token');
        await axios.post(`/expense/delete-expense/${id}`, null, { headers: { "Authorization": token } });
        document.getElementById(id).remove();
        totalCount--;
        if (table.rows.length == 1 && currentPage > 1) {
            currentPage--;
        }
        getExpenses();
    } catch (error) {
        showErrorMessage(error);
    }
}

function editExpense(id, amount, description, category) {
    event.target.parentNode.style.display = "none";
    document.getElementById('submit-btn').textContent = "Update";

    document.getElementById('id').value = id;
    document.getElementById('amount').value = amount;
    document.getElementById('description').value = description;
    document.getElementById('category').value = category;
}

async function showLeaderboard() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/premium/leaderboard`, { headers: { "Authorization": token } });
        // console.log(leaderboard.data);
        const leaderboard = document.getElementById('leaderboard-list');
        leaderboard.innerHTML = "";
        for (user of response.data) {
            leaderboard.innerHTML += `<li>Name - ${user.name} ; Total Expense - ${user.totalExpense}</li>`;
        }
    }
    catch (error) {
        showErrorMessage(error);
    }
}

async function downloadExpenses(e) {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/premium/download`, { headers: { "Authorization": token } });
        const a = document.createElement('a');
        a.href = response.data.fileURL;
        a.download = 'myexpense.csv';
        a.click();
    }
    catch (error) {
        showErrorMessage(error)
    }
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
}

function gotoPage(pageNo) {
    currentPage = pageNo;
    getExpenses();
}

function showPreviousPage() {
    currentPage--;
    getExpenses();
}

function showNextPage() {
    currentPage++;
    getExpenses();
}
