*** Settings ***
Library    SeleniumLibrary

*** Test Cases ***
Validar Home
    Open Browser    http://localhost:3000/home.html    chrome
    Page Should Contain    Bem-vindo
    Close Browser
