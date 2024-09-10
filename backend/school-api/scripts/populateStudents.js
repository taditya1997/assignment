const { connectToDatabase, client } = require('../db');

const classes = ['9', '10', '11', '12'];
const sections = ['A', 'B', 'C'];

async function populateClassesAndSections() {
  const db = await connectToDatabase();
  
  for (const className of classes) {
    await db.collection('classes').updateOne(
      { name: className },
      { $set: { name: className } },
      { upsert: true }
    );
  }

  for (const sectionName of sections) {
    await db.collection('sections').updateOne(
      { name: sectionName },
      { $set: { name: sectionName } },
      { upsert: true }
    );
  }

  console.log('Classes and sections populated');
}

function generateDummyStudents(count) {
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'George', 'Hannah', 'Ian', 'Julia', 'Kevin', 'Laura', 'Michael', 'Natalie', 'Oliver', 'Penny', 'Quentin', 'Rachel'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

  return Array.from({ length: count }, (_, i) => ({
    enrollmentNumber: `EN${(i + 1).toString().padStart(3, '0')}`,
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    class: classes[Math.floor(Math.random() * classes.length)],
    section: sections[Math.floor(Math.random() * sections.length)]
  }));
}

async function populateStudents() {
  let db;
  try {
    db = await connectToDatabase();
    const dummyStudents = generateDummyStudents(50);

    for (const student of dummyStudents) {
      await db.collection('students').findOneAndUpdate(
        { enrollmentNumber: student.enrollmentNumber },
        { $set: student },
        { upsert: true }
      );
    }

    console.log('50 dummy students added or updated successfully');
  } catch (error) {
    console.error('Error adding dummy students:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Database connection closed');
    }
  }
}

async function runPopulateScript() {
  try {
    await populateClassesAndSections();
    await populateStudents();
  } finally {
    await client.close();
  }
}

runPopulateScript();
