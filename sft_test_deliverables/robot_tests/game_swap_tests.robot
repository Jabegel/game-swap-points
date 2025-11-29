*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${BASE}    http://localhost:3000

*** Test Cases ***
Home Page Loads
    Open Browser    ${BASE}/home.html    chrome
    Title Should Be    GameSwap - Home
    Page Should Contain    GameSwap
    Page Should Contain Element    css:a.btn-primary[href="/login.html"]
    Page Should Contain Element    css:a.btn-outline-primary[href="/register.html"]
    [Teardown]    Close Browser

Login Page Loads
    Open Browser    ${BASE}/login.html    chrome
    Title Should Be    Login
    Page Should Contain Element    css:input#email
    Page Should Contain Element    css:input#senha
    Page Should Contain Element    css:button#btn-login
    [Teardown]    Close Browser
