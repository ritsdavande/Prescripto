const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
 
  console.log("Current Implementation Logic:");
  console.log("'NOT SELECTED':", calculateAge('NOT SELECTED'));
  console.log("'2000-01-01':", calculateAge('2000-01-01'));


  const calculateAgeNew = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
  
    // Check if dob is valid date string or "NOT SELECTED"
    if (dob === 'NOT SELECTED' || isNaN(birthDate.getTime())) {
        return "N/A"; 
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  console.log("\nNew Implementation Logic:");
  console.log("'NOT SELECTED':", calculateAgeNew('NOT SELECTED'));
  console.log("'2000-01-01':", calculateAgeNew('2000-01-01'));
  console.log("'invalid-date':", calculateAgeNew('invalid-date'));
