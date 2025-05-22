// customerTests.js
const customerService = require('./models/customerModel'); // 
// Update with correct path
const {
    createTransporter,
    getTransporterInfo,
    countOrdersByTransporter,
    countTrucksByTransporter,
    updateTransporterInfo,
    getAllTranpsorters
  } = require('./models/transporterModel');


const db = require('./database/db');
(async () => {await db.getDatabase();})();

// Helper function to print test results
const printResult = (testName, result) => {
  console.log(`\n----- TEST: ${testName} -----`);
  console.log(JSON.stringify(result, null, 2));
  console.log('-'.repeat(40));
};

// Run all tests sequentially
async function runTestsCustomers() {
  try {
    console.log("STARTING CUSTOMER MANAGEMENT TESTS\n");
    
    // Test 1: Create a new customer
    const newCustomer = {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      phone: "555-123-4567",
      dob: "1990-01-15",
      gender: "Male"
    };
    
    const customer = await customerService.createCustomer(newCustomer);
    printResult("Create Customer", customer);
    const customerId = customer.customer_id;
    
    // Test 2: Create customer with duplicate email
    const duplicateCustomer = {
      first_name: "Jane",
      last_name: "Smith",
      email: "john.doe@example.com", // Same email as first customer
      phone: "555-987-6543",
      dob: "1992-05-20",
      gender: "Female"
    };
    
    const duplicateResult = await customerService.createCustomer(duplicateCustomer);
    printResult("Create Duplicate Customer (should fail)", duplicateResult);
    
    // Test 3: Create a second valid customer
    const secondCustomer = {
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@example.com",
      phone: "555-987-6543",
      dob: "1992-05-20",
      gender: "Female"
    };
    
    const customer2 = await customerService.createCustomer(secondCustomer);
    printResult("Create Second Customer", customer2);
    const customer2Id = customer2.customer_id;
    
    // Test 4: Get customer info
    const customerInfo = await customerService.getCustomerInfo(customerId);
    printResult("Get Customer Info", customerInfo);
    
    // Test 5: Update customer info
    const updates = {
      phone: "555-111-2222",
      first_name: "Jonathan"
    };
    
    const updateResult = await customerService.updateCustomerInfo(customerId, updates);
    printResult("Update Customer Info", updateResult);
    
    // Test 6: Get updated customer info to verify changes
    const updatedCustomerInfo = await customerService.getCustomerInfo(customerId);
    printResult("Get Updated Customer Info", updatedCustomerInfo);
    
    // Test 7: Try updating with invalid fields (should ignore them)
    const invalidUpdates = {
      phone: "555-333-4444",
      invalid_field: "This should be ignored"
    };
    
    const invalidUpdateResult = await customerService.updateCustomerInfo(customerId, invalidUpdates);
    printResult("Update Customer with Invalid Fields", invalidUpdateResult);
    
    // Test 8: Get all customers
    const allCustomers = await customerService.getAllCustomers();
    printResult("Get All Customers", allCustomers);
    
    // Test 9: Add address for customer
    const addressData = {
      customer_id: customerId,
      address_label: "Home",
      street_address: "123 Main St",
      city: "Anytown",
      state: "CA",
      pin: "12345",
      contact_phone: "555-123-4567"
    };
    
    const address = await customerService.addAddress(addressData);
    printResult("Add Address", address);
    const addressId = address.address_id;
    
    // Test 10: Add second address
    const secondAddressData = {
      customer_id: customerId,
      address_label: "Work",
      street_address: "456 Office Blvd",
      city: "Businessville",
      state: "CA",
      pin: "54321",
      contact_phone: "555-888-9999"
    };
    
    const secondAddress = await customerService.addAddress(secondAddressData);
    printResult("Add Second Address", secondAddress);

    // Test 10: Add second address
    const thirdAddressData = {
        customer_id: 2,
        address_label: "Work",
        street_address: "456 Office Blvd",
        city: "Businessville",
        state: "CA",
        pin: "54321",
        contact_phone: "555-888-9999"
    };
    
    const thirdAddress = await customerService.addAddress(thirdAddressData);
    printResult("Add Third Address", thirdAddress);


    // Test 11: Get customer addresses
    const addresses = await customerService.getCustomerAddresses(customerId);
    printResult("Get Customer Addresses", addresses);
    
    // Test 12: Count orders (should be 0 initially)
    const orderCount = await customerService.countOrdersByCustomer(customerId);
    printResult("Count Orders", orderCount);
    
    // Test 13: Remove an address
    const removeAddressResult = await customerService.removeAddress(addressId);
    printResult("Remove Address", removeAddressResult);
    
    // Test 14: Get customer addresses after removal
    const remainingAddresses = await customerService.getCustomerAddresses(customerId);
    printResult("Get Customer Addresses After Removal", remainingAddresses);
    
    // Test 15: Delete customer
    const deleteResult = await customerService.deleteCustomer(customerId);
    printResult("Delete Customer", deleteResult);
    
    // Test 16: Try to get deleted customer (should fail)
    const deletedCustomerInfo = await customerService.getCustomerInfo(customerId);
    printResult("Get Deleted Customer (should fail)", deletedCustomerInfo);
    
    console.log("\nALL TESTS COMPLETED");
    
  } catch (error) {
    console.error("TEST ERROR:", error.message);
    console.error(error.stack);
  }
}


async function runTestsTransporters() {
  
  // Test data
  const sampleTransporter = {
    name: 'Highway Express',
    gst_in: '22AAAAA0000A1Z5',
    pan: 'AAAAA0000A',
    street_address: '123 Transport Lane',
    city: 'Mumbai',
    state: 'Maharashtra',
    pin: '400001',
    primary_contact: '9876543210',
    secondary_contact: '8765432109',
    email: 'info@highwayexpress.com'
  };
  
  // Second transporter for testing multiple records
  const anotherTransporter = {
    name: 'Roadway Logistics',
    gst_in: '33BBBBB1111B1Z6',
    pan: 'BBBBB1111B',
    street_address: '456 Carrier Road',
    city: 'Delhi',
    state: 'Delhi',
    pin: '110001',
    primary_contact: '7654321098',
    secondary_contact: '6543210987',
    email: 'info@roadwaylogistics.com'
  };
  
  // Updates for testing the update function
  const transporterUpdates = {
    name: 'Highway Express Premium',
    primary_contact: '9876543211',
    street_address: '123 Transport Avenue'
  };
  

    console.log('=== TESTING TRANSPORTER MODULE ===\n');
    
    try {
      // Test 1: Create a new transporter
      console.log('Test 1: Creating a new transporter...');
      const createdTransporter = await createTransporter(sampleTransporter);
      console.log('Created transporter:', createdTransporter);
      
      if (createdTransporter.error) {
        console.error('Failed to create transporter:', createdTransporter.error);
      } else {
        const transporterId = createdTransporter.transporter_id;
        console.log(`Transporter created with ID: ${transporterId}\n`);
        
        // Test 2: Get transporter info
        console.log('Test 2: Getting transporter info...');
        const transporterInfo = await getTransporterInfo(transporterId);
        console.log('Transporter info:', transporterInfo, '\n');
        
        // Test 3: Count orders by transporter
        console.log('Test 3: Counting orders for transporter...');
        const orderCount = await countOrdersByTransporter(transporterId);
        console.log(`Transporter has ${orderCount} orders\n`);
        
        // Test 4: Count trucks by transporter
        console.log('Test 4: Counting trucks for transporter...');
        const truckCount = await countTrucksByTransporter(transporterId);
        console.log(`Transporter has ${truckCount} trucks\n`);
        
        // Test 5: Update transporter info
        console.log('Test 5: Updating transporter info...');
        const updateResult = await updateTransporterInfo(transporterId, transporterUpdates);
        console.log('Update result:', updateResult);
        
        // Test 6: Get updated transporter info
        console.log('Test 6: Getting updated transporter info...');
        const updatedTransporterInfo = await getTransporterInfo(transporterId);
        console.log('Updated transporter info:', updatedTransporterInfo, '\n');
        
        // Test 7: Create another transporter
        console.log('Test 7: Creating another transporter...');
        const createdTransporter2 = await createTransporter(anotherTransporter);
        console.log('Created second transporter:', createdTransporter2, '\n');
        
        // Test 8: Get all transporters
        console.log('Test 8: Getting all transporters...');
        const allTransporters = await getAllTranpsorters();
        console.log(`Retrieved ${allTransporters ? allTransporters.length : 0} transporters:`);
        console.log(allTransporters, '\n');
        
        // Test 9: Test duplicate email error
        console.log('Test 9: Testing duplicate email validation...');
        const duplicateEmailTest = await createTransporter({
          ...sampleTransporter,
          name: 'Duplicate Email Test'
        });
        console.log('Duplicate email test result:', duplicateEmailTest, '\n');
        
        // Test 10: Test update with invalid field
        console.log('Test 10: Testing update with invalid fields...');
        try {
          const invalidUpdate = await updateTransporterInfo(transporterId, {
            invalidField: 'This should be ignored',
            name: 'Valid Name Update'
          });
          console.log('Update with invalid field result:', invalidUpdate, '\n');
        } catch (error) {
          console.error('Error during invalid field update:', error.message, '\n');
        }
      }
    } catch (error) {
      console.error('Test failed with error:', error);
    }
    
    console.log('=== TESTS COMPLETED ===');
}






// Run the tests
// runTestsCustomers();
runTestsTransporters();