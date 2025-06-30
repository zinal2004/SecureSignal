// backend/utils/grantAdminPermissions.js
const mongoose = require('mongoose');
require('dotenv').config();

async function grantPermissions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const admins = db.collection('admins');

    const result = await admins.updateOne(
      { email: "admin@securesignal.com" },
      {
        $set: {
          "permissions.viewReports": true,
          "permissions.editReports": true,
          "permissions.deleteReports": true,
          "permissions.viewAnalytics": true
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log("Admin permissions updated successfully!");
    } else {
      console.log("No admin user found or permissions already set.");
    }
    process.exit(0);
  } catch (error) {
    console.error("Error updating admin permissions:", error);
    process.exit(1);
  }
}

grantPermissions();