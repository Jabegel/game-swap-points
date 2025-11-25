*** Settings ***
Library    SeleniumLibrary

*** Test Cases ***
Validar Dashboard
    Open Browser    http://localhost:3000/dashboard.html    chrome
    Page Should Contain    Dashboard
    Close Browser
