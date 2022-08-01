const {  
  client,
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  createTags,
  addTagsToPost,
  getPostsByTagName
} = require('./index');

async function dropTables() {
  try {

      await client.query(`
          DROP TABLE IF EXISTS post_tags;
          DROP TABLE IF EXISTS tags;
          DROP TABLE IF EXISTS posts;
          DROP TABLE IF EXISTS users;
      `);

  } catch (error) {
    throw error;
  }
}

async function createTables() {
  try {

    await client.query(`
      CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username varchar(255) UNIQUE NOT NULL,
          password varchar(255) NOT NULL,
          name varchar(255) NOT NULL,
          location varchar(255) NOT NULL,
          active boolean DEFAULT true
      );
      CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          "authorId" INTEGER REFERENCES users(id),
          title varchar(255) NOT NULL,
          content TEXT NOT NULL,
          active BOOLEAN DEFAULT true
      );
      CREATE TABLE tags (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) UNIQUE NOT NULL
      );
      CREATE TABLE post_tags (
          "postId" INTEGER REFERENCES posts(id),
          "tagId" INTEGER REFERENCES tags(id),
          UNIQUE ("postId", "tagId")
      );
    `);

  } catch (error) {
      throw error;
  }
}

async function createInitialUsers() {
  try {

      await createUser({ 
          username: 'albert', 
          password: 'bertie99',
          name: 'Al Bert',
          location: 'Sidney, Australia' 
      });
      await createUser({ 
          username: 'sandra', 
          password: '2sandy4me',
          name: 'Just Sandra',
          location: 'Ain\'t tellin\''
      });
      await createUser({ 
          username: 'glamgal',
          password: 'soglam',
          name: 'Joshua',
          location: 'Upper East Side'
      });

  } catch (error) {
      throw error;
  }
}

async function createInitialPosts() {
  try {
      const [albert, sandra, glamgal] = await getAllUsers();
  
      await createPost({
          authorId: albert.id,
          title: "First Post",
          content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
          tags: ["#happy", "#youcandoanything"]
      });

      await createPost({
          authorId: sandra.id,
          title: "How does this work?",
          content: "Seriously, does this even do anything?",
          tags: ["#happy", "#worst-day-ever"]
      });

      await createPost({
          authorId: glamgal.id,
          title: "Living the Glam Life",
          content: "Do you even? I swear that half of you are posing.",
          tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
      });
  } catch (error) {
    throw error;
  }
}

async function rebuildDB() {
  try {
      client.connect();
  
      await dropTables();
      await createTables();
      await createInitialUsers();
      await createInitialPosts();
  } catch (error) {
      throw error;
  }
}

async function testDB() {
  try {
      console.log("Starting to test database...");
  
      // getAllUsers
      console.log();
      console.log("Calling getAllUsers");
      const users = await getAllUsers();
      console.log("Result:", users);
  
      // updateUser
      console.log();
      console.log("-- updateUser --");
      const updateUserResult = await updateUser(users[0].id, {
          name: "Newname Sogood",
          location: "Lesterville, KY"
      });
      console.log("Result:", updateUserResult);
  
      // getAllPosts
      console.log();
      console.log("-- Calling getAllPosts --");
      const posts = await getAllPosts();
      console.log("Result:", posts);
  
      // updatePost
      console.log();
      console.log("-- updatePost --");
      const updatePostResult = await updatePost(posts[0].id, {
          title: "New Title",
          content: "Updated Content"
      });
      console.log("Result:", updatePostResult);

      // getUserById
      console.log();
      console.log("-- getUserById --");
      const albert = await getUserById(1);
      console.log("Result:", albert);

      // updatePost (tags)
      console.log();
      console.log("-- updatePost --");
      const updatePostTagsResult = await updatePost(posts[1].id, {
          tags: ["#youcandoanything", "#redfish", "#bluefish"]
      });
      console.log("Result:", updatePostTagsResult);

      // getPostsByTagName
      console.log();
      console.log("-- getPostsByTagName (#happy) --");
      const postsWithHappy = await getPostsByTagName("#happy");
      postsWithHappy.forEach((happyPost, index) => {
          console.log(`Post ${index+1}:`, happyPost);
      });

      console.log("Finished database tests!");

  } catch (error) {
      console.log("Error during testDB");
      throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
