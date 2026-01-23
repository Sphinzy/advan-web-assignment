/* ================= LOGOUT ================= */
const btnLogout = document.querySelector("#btnLogout");
const id = localStorage.getItem('id')
if (btnLogout) {
    btnLogout.addEventListener("click", () => {
            location.href = "../pages/login.html";
    });
}
fetch(`http://localhost:3000/api/users/${id}`)
.then(res => res.json())
    .then(resData => {
        console.log(resData);
        document.querySelector('#profile-image').src = resData.data.avatar;
    })
// window.onload = () => {
//     document.querySelector('#logoImage').src =
//         '../assets/images/logo.png';
// };
