const express = require("express");
const fetch = require("node-fetch");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
// console.log(process.env.PASSWORD)

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
  .connect(`mongodb+srv://anujsinghth:`+process.env.PASSWORD+`@cluster0.ycp7zus.mongodb.net/PINCODE?retryWrites=true&w=majority&appName=Cluster0E`)
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
    console.log("cant connect");
  });

// mongoose
//   .connect("mongodb://127.0.0.1:27017/PINCODE")
//   .then(() => {
//     console.log("connected to DB");
//   })
//   .catch((err) => {
//     console.log("cant connect");
//   });

const pincodeSchema = new mongoose.Schema({
  officename: {
    type: String,
    required: true,
  },
  pincode: {
    type: Number,
    required: true,
  },
  officetype: {
    type: String,
    required: true,
  },
  deliverystatus: {
    type: String,
    required: true,
  },
  divisionname: {
    type: String,
    required: true,
  },
  regionname: {
    type: String,
    required: true,
  },
  circlename: {
    type: String,
    required: true,
  },
  taluk: {
    type: String,
    required: true,
  },
  districtname: {
    type: String,
    required: true,
  },
  statename: {
    type: String,
    required: true,
  },
});
const PIN = mongoose.model("PIN", pincodeSchema);

//showing and saving the data to database here
app.get("/", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.data.gov.in/resource/6176ee09-3d56-4a3b-8115-21841576b2f6?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json&offset=0&limit=10",
      {}
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const records = data.records;
    res.json(records); 
      await PIN.deleteMany();
    for (const record of records) {
        try {
          const entryJ = new PIN(record);
          await entryJ.save();
        } catch (error) {
          console.log(error);
        }
      }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//adding new entry 
app.post("/add", async (req, res) => {
    try {
      const { officename, pincode, officetype, deliverystatus, divisionname, regionname, circlename, taluk, districtname, statename } = req.body;
      
      const newRecord = new PIN({
        officename,
        pincode,
        officetype,
        deliverystatus,
        divisionname,
        regionname,
        circlename,
        taluk,
        districtname,
        statename
      });
      await newRecord.save();
      res.status(201).json({ message: "Record added successfully"});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to add record"});
    }
  });
  module.exports = app;



  //updating the existing record based on officename
  app.put('/edit/:officename', (req, res) => {
    const { pincode, officetype, deliverystatus, divisionname, regionname, circlename, taluk, districtname, statename } = req.body;
    const officename = req.params.officename;
  
    PIN.findOneAndUpdate(
      { officename: officename },
      {
        $set: {
          pincode,
          officetype,
          deliverystatus,
          divisionname,
          regionname,
          circlename,
          taluk,
          districtname,
          statename
        },
      },
      { new: true } // To return the updated document
    )
      .then((updatedPIN) => {
        if (!updatedPIN) {
          return res.status(404).json({ message: 'officename not found' });
        }
        res.json({ message: 'Details updated successfully'});
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      });
  });
  
//deletion based on officename and officetype

app.post('/delete', async (req, res) => {
    try {
      const { officename, officetype } = req.body;
  
      if (!officename || !officetype) {
        return res.status(400).json({ message: 'Both officename and officetype are required for deletion'});
      }

      const removed = await PIN.findOneAndDelete({ officename: officename, officetype: officetype });
  
      if (!removed) {
        return res.status(404).json({ message: 'Not found' });
      }
      res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


// searching by district and showing the info like officename and regionname

app.get('/search', async (req, res) => {
  try {
    const { district } = req.query;

    if (!district) {
      return res.status(400).json({ message: 'District is required for searching' });
    }
    const filteredOffices = await PIN.find();

    const result = filteredOffices.filter(office => office.districtname.toLowerCase() === district.toLowerCase());
    const filteredResult = result.map(office => ({ officename: office.officename, officetype: office.officetype }));

    if (!filteredResult.length) {
      return res.status(404).json({ message: `No offices found in the district` });
    }

    res.status(200).json(filteredResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

  
//showing the pincode based on delivery status and regionname

app.get('/search2', async (req, res) => {
    try {
      const { deliverystatus, regionname } = req.query;
  
      if (!deliverystatus && !regionname) {
        return res.status(400).json({ message: 'Deliverystatus or Regionname is required for searching' });
      }
      const filteredOffices = await PIN.find();

      const filteredResult = filteredOffices.filter(office => {
        const matchdeliverystatus = deliverystatus ? office.deliverystatus === deliverystatus : true;
        const matchRegion = regionname ? office.regionname.toLowerCase() === regionname.toLowerCase() : true;
        return matchdeliverystatus && matchRegion;
      });
  
      const result = filteredResult.map(office => ({ pincode: office.pincode }));
  
      if (!result.length) {
        return res.status(404).json({ message: 'No pincodes found with the specified criteria' });
      }
  
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
app.listen(3000, () => {
  console.log("Running at 3000");
});

  