function fetchUser() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ id: 1, name: "Jane Doe" });
    }, 1500);
  });
}

function fetchPosts(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([
        { postId: 101, title: "Post One" },
        { postId: 102, title: "Post Two" },
      ]);
    }, 2000);
  });
}

async function getUserAndPosts() {
  try {
    const user = await fetchUser();
    const posts = await fetchPosts(user.id);

    const combinedData = { user, posts };
    console.log("Combined Data: ", combinedData);

    console.log("All data fetched sucessfully");

    return combinedData;
  } catch (error) {
    console.log("Error: ", error);
  }
}

getUserAndPosts();
