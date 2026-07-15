import os, re

files = [
  'client/src/components/DriverPortal/TripHistory/TripDetails.jsx',
  'client/src/components/DriverPortal/TripHistory/TripHistoryCard.jsx',
  'client/src/components/MyRides/ActiveRideCard.jsx',
  'client/src/components/Reviews/ReviewCard.jsx',
  'client/src/components/Safety/SafetyAlertCard.jsx',
  'client/src/components/Schedule/ScheduleManager.jsx',
  'client/src/components/TripHistory/RideDetails.jsx',
  'client/src/components/TripHistory/RideHistoryCard.jsx'
]

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        content = re.sub(r'\{([a-zA-Z0-9_\.\?]+)pickupLocation\}', r"{typeof \1pickupLocation === 'object' ? \1pickupLocation?.address || 'Unknown' : \1pickupLocation}", content)
        content = re.sub(r'\{([a-zA-Z0-9_\.\?]+)dropoffLocation\}', r"{typeof \1dropoffLocation === 'object' ? \1dropoffLocation?.address || 'Unknown' : \1dropoffLocation}", content)
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print('Patched', f)
