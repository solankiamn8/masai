function fetchUserData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.3) {
        reject("Failed to fetch user data");
      } else {
        resolve({ id: 1, name: "John Doe", role: "Admin" });
      }
    }, 2000);
  });
}

function fetchUserPermissions() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.3) {
        reject("Failed to fetch user permissions");
      } else {
        resolve(["read", "write", "delete"]);
      }
    }, 1500);
  });
}

Promise.all([fetchUserData(), fetchUserPermissions()])
  .then(([user, permissions]) => {
    console.log("User Details: ", user);
    console.log("Permission Details: ", permissions);
  })
  .catch((err) => {
    console.log("Error: ", err);
  })
  .finally(() => {
    console.log("Fetch attempt complete");
  });
