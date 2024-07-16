import { faker } from "@faker-js/faker";
import User from "../models/user.model.js";
const imageUrls = [
  "https://picsum.photos/200/300",
  "https://picsum.photos/250/350",
  "https://picsum.photos/300/400",
  "https://picsum.photos/350/450",
  "https://picsum.photos/400/500",
  "https://via.placeholder.com/200x300",
  "https://via.placeholder.com/250x350",
  "https://via.placeholder.com/300x400",
  "https://via.placeholder.com/350x450",
  "https://via.placeholder.com/400x500",
];
const arr1 = ["2024", "2025", "2026"];
let techFields = [
  "Web Development",
  "App Development",
  "Cloud & Devops",
  "Machine Learning",
  "Artificial Intelligence",
  "Automation",
  "Data Structures",
  "Competitive Programming"
]
let technologies = [
  "Flutter",
  "React",
  "Angular",
  "Vue.js",
  "Node.js",
  "Spring Boot",
  "React Native",
  "Swift",
];
let work = [true, false];
let branches = [
  "Computer Science",
  "Information Technology",
  "Electronics",
];

const createUser = async (numUsers) => {
  try {
    const usersPromise = [];

    for (let i = 0; i < numUsers; i++) {
      const tempUser = User.create({
        name: faker.person.fullName(),
        username: faker.internet.userName(),
        bio: faker.lorem.sentence(10),
        password: "password",
        url: imageUrls[Math.floor(Math.random() * arr1.length)],
        year: arr1[Math.floor(Math.random() * arr1.length)],
        field: techFields
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.floor(Math.random() * 4) + 1),
        technology: technologies
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.floor(Math.random() * 6) + 1),
        branch: branches[Math.floor(Math.random() * branches.length)],
      });
      usersPromise.push(tempUser);
    }

    await Promise.all(usersPromise);

    console.log("Users created", numUsers);
    process.exit(1);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export { createUser };
