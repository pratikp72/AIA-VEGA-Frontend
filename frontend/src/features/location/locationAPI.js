// Mock API for location data
export async function fetchPlants() {
  // Replace with real API call
  return [
    { id: 'plant1', name: 'Moralya Plant' },
    { id: 'plant2', name: 'Other Plant' },
  ];
}

export async function fetchUnitsByPlant(plantId) {
  // Replace with real API call
  if (plantId === 'plant1') {
    return [
      {
        id: 'unit3',
        name: 'Unit 3',
        image: '/unit3.jpg',
        address: 'Plot 104, GVMM Estate, Odhav Rd, Odhav Industrial Estate, Ahmedabad, Gujarat 382415',
        siteManager: 'Sarah Michelle',
        hrManager: 'Elvin Patel',
        contact: '9325363126',
      },
      {
        id: 'unit4',
        name: 'Unit 4',
        image: '/unit4.jpg',
        address: 'Plot 105, GVMM Estate, Odhav Rd, Odhav Industrial Estate, Ahmedabad, Gujarat 382415',
        siteManager: 'John Doe',
        hrManager: 'Priya Shah',
        contact: '9876543210',
      },
      {
        id: 'unit5',
        name: 'Unit 5',
        image: '/unit5.jpg',
        address: 'Plot 106, GVMM Estate, Odhav Rd, Odhav Industrial Estate, Ahmedabad, Gujarat 382415',
        siteManager: 'Amit Kumar',
        hrManager: 'Rina Mehta',
        contact: '9988776655',
      },
      {
        id: 'unit6',
        name: 'Unit 6',
        image: '/unit6.jpg',
        address: 'Plot 107, GVMM Estate, Odhav Rd, Odhav Industrial Estate, Ahmedabad, Gujarat 382415',
        siteManager: 'Suresh Singh',
        hrManager: 'Meena Joshi',
        contact: '9123456780',
      },
    ];
  }
  if (plantId === 'plant2') {
    return [
      {
        id: 'unit7',
        name: 'Unit 7',
        image: '/unit7.jpg',
        address: 'Plot 201, ABC Estate, Vatva, Ahmedabad, Gujarat 382445',
        siteManager: 'Rakesh Patel',
        hrManager: 'Sunita Rao',
        contact: '9001122334',
      },
      {
        id: 'unit8',
        name: 'Unit 8',
        image: '/unit8.jpg',
        address: 'Plot 202, ABC Estate, Vatva, Ahmedabad, Gujarat 382445',
        siteManager: 'Vikas Sharma',
        hrManager: 'Anjali Desai',
        contact: '9011223344',
      },
    ];
  }
  return [];
}
