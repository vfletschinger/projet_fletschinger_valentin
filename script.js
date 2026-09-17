"use strict";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FIELD_LABELS = {
    login: "Login",
    password: "Mot de passe",
    confirmPassword: "Confirmation du mot de passe",
    lastName: "Nom",
    firstName: "Prénom",
    address: "Adresse",
    email: "Email",
    phone: "Téléphone",
    birthDate: "Date de naissance",
};

const form = document.getElementById("signup-form");
const errorBox = document.getElementById("error-box");
const signupSection = document.getElementById("signup-section");
const summarySection = document.getElementById("summary-section");
const backButton = document.getElementById("back-button");

function getFormValues() {
    const values = {};

    for (const name of Object.keys(FIELD_LABELS)) {
        const value = form.elements[name].value;
        values[name] = name === "password" || name === "confirmPassword" ? value : value.trim();
    }

    return values;
}

function validate(values) {
    const errors = [];

    for (const [name, label] of Object.entries(FIELD_LABELS)) {
        if (values[name] === "") {
            errors.push({ field: name, message: `Le champ « ${label} » est obligatoire.` });
        }
    }

    if (values.email !== "" && !EMAIL_REGEX.test(values.email)) {
        errors.push({ field: "email", message: "L'adresse email n'est pas valide." });
    }

    if (values.password !== "" && values.confirmPassword !== "" && values.password !== values.confirmPassword) {
        errors.push({ field: "confirmPassword", message: "Les mots de passe ne correspondent pas." });
    }

    return errors;
}

function clearErrors() {
    errorBox.hidden = true;
    errorBox.replaceChildren();

    for (const input of form.querySelectorAll("input.invalid")) {
        input.classList.remove("invalid");
        input.removeAttribute("aria-invalid");
    }
}

function showErrors(errors) {
    const title = document.createElement("strong");
    title.textContent = "Veuillez corriger les erreurs suivantes :";

    const list = document.createElement("ul");
    for (const error of errors) {
        const item = document.createElement("li");
        item.textContent = error.message;
        list.appendChild(item);

        const input = form.elements[error.field];
        input.classList.add("invalid");
        input.setAttribute("aria-invalid", "true");
    }

    errorBox.replaceChildren(title, list);
    errorBox.hidden = false;

    form.elements[errors[0].field].focus();
}

function formatDate(isoDate) {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
}

function showSummary(values) {
    for (const element of summarySection.querySelectorAll("[data-field]")) {
        const name = element.dataset.field;
        element.textContent = name === "birthDate" ? formatDate(values[name]) : values[name];
    }

    signupSection.hidden = true;
    summarySection.hidden = false;
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    const values = getFormValues();
    const errors = validate(values);

    if (errors.length > 0) {
        showErrors(errors);
        return;
    }

    showSummary(values);
});

form.addEventListener("input", (event) => {
    event.target.classList.remove("invalid");
    event.target.removeAttribute("aria-invalid");
});

backButton.addEventListener("click", () => {
    summarySection.hidden = true;
    signupSection.hidden = false;
});
