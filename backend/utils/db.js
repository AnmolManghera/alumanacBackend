import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connection = await mongoose.connect('mongodb+srv://anmoldeepmanghera:anmoldeepmanghera@cluster0.kxlh8gn.mongodb.net/?retryWrites=true&w=majority');
        console.log(`MongoDb Connected: ${connection.connection.host}`)
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;