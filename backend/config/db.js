import mongoose from "mongoose";

export const connectDB = async () =>{
    await mongoose.connect('mongodb+srv://NaraResume123:resume123@cluster0.vgxrkkm.mongodb.net/RESUME')
    .then(() => 
        console.log("DB connected")
    )
}