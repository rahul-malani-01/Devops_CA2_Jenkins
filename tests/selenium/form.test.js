const path = require("node:path");
const { pathToFileURL } = require("node:url");
const test = require("node:test");
const assert = require("node:assert/strict");
const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const formUrl = pathToFileURL(path.resolve(__dirname, "..", "..", "index.html")).href;

function buildDriver() {
  const runHeadless = process.env.HEADLESS === "true";
  const options = new chrome.Options()
    .addArguments("--window-size=1366,900")
    .addArguments("--disable-gpu")
    .addArguments("--start-maximized");

  if (runHeadless) {
    options.addArguments("--headless=new");
  }

  return new Builder().forBrowser("chrome").setChromeOptions(options).build();
}

async function fillValidData(driver) {
  await driver.findElement(By.id("studentName")).clear();
  await driver.findElement(By.id("studentName")).sendKeys("Rahul Malani");
  await sleep(1000);

  await driver.findElement(By.id("email")).clear();
  await driver.findElement(By.id("email")).sendKeys("rahul.malani@example.com");
  await sleep(1000);

  await driver.findElement(By.id("mobile")).clear();
  await driver.findElement(By.id("mobile")).sendKeys("9876543210");
  await sleep(1000);

  await driver.findElement(By.id("department")).sendKeys("Computer Science");
  await sleep(1000);
  await driver.findElement(By.css("input[name='gender'][value='Male']")).click();
  await sleep(1000);

  await driver.findElement(By.id("comments")).clear();
  await driver
    .findElement(By.id("comments"))
    .sendKeys(
      "This course content is very clear helpful practical and engaging for all students."
    );
  await sleep(1000);
}

test("Form page opens successfully", async () => {
  const driver = await buildDriver();
  try {
    await driver.get(formUrl);
    await sleep(2000);
    const title = await driver.getTitle();
    const heading = await driver.findElement(By.id("form-title")).getText();

    assert.equal(title, "Student Feedback Registration Form");
    assert.equal(heading, "Student Feedback Registration Form");
  } finally {
    await driver.quit();
  }
});

test("Enter valid data and verify successful submission", async () => {
  const driver = await buildDriver();
  try {
    await driver.get(formUrl);
    await sleep(2000);
    await fillValidData(driver);
    await sleep(1000);

    await driver.findElement(By.id("submitBtn")).click();
    await sleep(2000);

    await driver.wait(until.elementTextContains(driver.findElement(By.id("formMessage")), "Feedback submitted successfully."), 5000);
    const status = await driver.findElement(By.id("formMessage")).getText();
    assert.equal(status, "Feedback submitted successfully.");
  } finally {
    await driver.quit();
  }
});

test("Leave mandatory fields blank and check error messages", async () => {
  const driver = await buildDriver();
  try {
    await driver.get(formUrl);
    await sleep(2000);
    await driver.findElement(By.id("submitBtn")).click();
    await sleep(1500);

    await driver.wait(until.elementTextContains(driver.findElement(By.id("formMessage")), "Please fix the errors"), 5000);
    await sleep(1000);

    assert.equal(await driver.findElement(By.id("studentNameError")).getText(), "Student name should not be empty.");
    assert.equal(await driver.findElement(By.id("departmentError")).getText(), "Please select your department.");
    assert.equal(await driver.findElement(By.id("genderError")).getText(), "Please select your gender.");
    assert.equal(await driver.findElement(By.id("commentsError")).getText(), "Feedback comments should not be blank.");
  } finally {
    await driver.quit();
  }
});

test("Enter invalid email format and verify validation", async () => {
  const driver = await buildDriver();
  try {
    await driver.get(formUrl);
    await sleep(2000);

    await driver.findElement(By.id("studentName")).sendKeys("Yash");
    await sleep(1000);
    await driver.findElement(By.id("email")).sendKeys("invalid-email");
    await sleep(1000);
    await driver.findElement(By.id("mobile")).sendKeys("9876543210");
    await sleep(1000);
    await driver.findElement(By.id("department")).sendKeys("Computer Science");
    await sleep(1000);
    await driver.findElement(By.css("input[name='gender'][value='Male']")).click();
    await sleep(1000);
    await driver
      .findElement(By.id("comments"))
      .sendKeys("This form is easy to use and gives clear instructions for every field.");
    await sleep(1000);

    await driver.findElement(By.id("submitBtn")).click();
    await sleep(1500);

    assert.equal(await driver.findElement(By.id("emailError")).getText(), "Enter a valid email address.");
  } finally {
    await driver.quit();
  }
});

test("Enter invalid mobile number and verify validation", async () => {
  const driver = await buildDriver();
  try {
    await driver.get(formUrl);
    await sleep(2000);

    await driver.findElement(By.id("studentName")).sendKeys("Yash");
    await sleep(1000);
    await driver.findElement(By.id("email")).sendKeys("yash@example.com");
    await sleep(1000);
    await driver.findElement(By.id("mobile")).sendKeys("98AB543");
    await sleep(1000);
    await driver.findElement(By.id("department")).sendKeys("Computer Science");
    await sleep(1000);
    await driver.findElement(By.css("input[name='gender'][value='Male']")).click();
    await sleep(1000);
    await driver
      .findElement(By.id("comments"))
      .sendKeys("The interface is simple responsive and helpful for submitting academic feedback quickly.");
    await sleep(1000);

    await driver.findElement(By.id("submitBtn")).click();
    await sleep(1500);

    assert.equal(await driver.findElement(By.id("mobileError")).getText(), "Enter a valid 10-digit mobile number.");
  } finally {
    await driver.quit();
  }
});

test("Check whether dropdown selection works properly", async () => {
  const driver = await buildDriver();
  try {
    await driver.get(formUrl);
    await sleep(2000);

    const department = driver.findElement(By.id("department"));
    await department.sendKeys("Mechanical");
    await sleep(1500);

    const selectedValue = await department.getAttribute("value");
    assert.equal(selectedValue, "Mechanical");
  } finally {
    await driver.quit();
  }
});

test("Check whether Submit and Reset buttons work correctly", async () => {
  const driver = await buildDriver();
  try {
    await driver.get(formUrl);
    await sleep(2000);

    await fillValidData(driver);
    await sleep(1000);

    await driver.findElement(By.id("resetBtn")).click();
    await sleep(1500);

    await driver.wait(until.elementTextContains(driver.findElement(By.id("formMessage")), "Form reset successfully."), 5000);
    await sleep(1000);

    const nameAfterReset = await driver.findElement(By.id("studentName")).getAttribute("value");
    const emailAfterReset = await driver.findElement(By.id("email")).getAttribute("value");
    const commentsAfterReset = await driver.findElement(By.id("comments")).getAttribute("value");

    assert.equal(nameAfterReset, "");
    assert.equal(emailAfterReset, "");
    assert.equal(commentsAfterReset, "");
    await sleep(1000);

    await fillValidData(driver);
    await sleep(1000);
    const departmentValue = await driver.findElement(By.id("department")).getAttribute("value");
    const genderChecked = await driver
      .findElement(By.css("input[name='gender'][value='Male']"))
      .getAttribute("checked");

    assert.equal(departmentValue, "Computer Science");
    assert.ok(genderChecked !== null);
    await sleep(1000);

    await driver.findElement(By.id("submitBtn")).click();
    await sleep(2000);
    await driver.wait(
      until.elementTextContains(
        driver.findElement(By.id("formMessage")),
        "Feedback submitted successfully."
      ),
      8000
    );

    const status = await driver.findElement(By.id("formMessage")).getText();
    assert.equal(status, "Feedback submitted successfully.");
  } finally {
    await driver.quit();
  }
});
