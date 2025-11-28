*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${BASE}    http://localhost:3000

*** Test Cases ***
Home Page Loads
    Open Browser    ${BASE}/home.html    chrome
    Title Should Contain    Home
    Page Should Contain Element    css:button#btn-refresh
    [Teardown]    Close Browser

Login Page Loads
    Open Browser    ${BASE}/login.html    chrome
    Title Should Contain    Login
    Page Should Contain Element    css:input#username
    Page Should Contain Element    css:input#password
    [Teardown]    Close Browser