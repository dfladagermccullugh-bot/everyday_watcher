// Narrative layers. Editorial selections that reference inventory rows by number.
// Scope is an editorial reading of the report's descriptions, not measured prevalence:
//   c  common: part of ordinary infrastructure for many people
//   k  conditional: depends on a device, service, employer, or choice
//   l  location-specific: depends on jurisdiction or local deployment

export const DAY = [
  {
    id: 'wake',
    time: '06:45',
    title: 'Waking up',
    line: 'The phone on the nightstand has been talking to the network all night.',
    body: 'Before you open an app, a phone produces network records. Opening apps adds identifiers, permissions, and backups.',
    rows: [[88, 'c'], [102, 'c'], [85, 'c'], [84, 'c'], [194, 'c'], [92, 'k'], [126, 'k'], [127, 'k'], [128, 'k'], [95, 'k'], [142, 'k'], [236, 'k'], [49, 'k'], [212, 'l'], [215, 'l']],
  },
  {
    id: 'drive',
    time: '08:10',
    title: 'Driving to work',
    line: 'A car is both a sensor and a thing that is sensed.',
    body: 'Roadside readers record the vehicle. Systems inside the vehicle record how it is driven. The phone in your pocket keeps reporting too.',
    rows: [[10, 'l'], ['Fixed neighborhood ALPR networks', 'l'], ['Mobile municipal ALPR scanning fleets', 'l'], ['Connected-car data broker feeds', 'k'], [7, 'l'], [8, 'l'], [9, 'l'], [185, 'l'], [12, 'l'], [11, 'l'], [200, 'k'], [199, 'k'], [203, 'k'], [169, 'k'], [39, 'k'], [88, 'c'], [226, 'l']],
    feature: 'plates',
  },
  {
    id: 'walk',
    time: '08:40',
    title: 'Walking through public space',
    line: 'The street records presence without asking for it.',
    body: 'Cameras, microphones, and counters are part of the street. A phone’s radios can be observed by systems you never interact with.',
    rows: [[1, 'l'], [13, 'l'], ['Real-Time Crime Centers (RTCCs) & camera registries', 'l'], [16, 'l'], [46, 'l'], [47, 'l'], [227, 'l'], [225, 'l'], [4, 'c'], [192, 'k'], [188, 'k'], [184, 'k'], [33, 'l'], [37, 'c']],
  },
  {
    id: 'work',
    time: '09:05',
    title: 'Entering a workplace',
    line: 'A badge opens the door and writes down that it did.',
    body: 'Managed workplaces can log access, devices, and communications. Some convert that activity into scores.',
    rows: [[182, 'k'], [256, 'k'], [229, 'k'], [230, 'k'], ['Sociometric employee badges', 'k'], ['OS-level screen-capture & recall indexing', 'k'], [2, 'c'], [248, 'k'], [110, 'k'], [112, 'k'], [253, 'k'], [254, 'k'], [250, 'k'], [251, 'k'], [252, 'k'], [147, 'k'], [289, 'k']],
  },
  {
    id: 'shop',
    time: '12:30',
    title: 'Shopping at lunch',
    line: 'Checkout is a data event as much as a payment.',
    body: 'A card links merchant, time, and amount. A loyalty number links this trip to every earlier one. In some stores, cameras and radios measure the visit itself.',
    rows: [[157, 'c'], [159, 'c'], [160, 'k'], ['Card-linked offers & offline purchase attribution', 'k'], ['Retail return-fraud & ban databases', 'k'], [2, 'c'], [179, 'c'], [180, 'k'], [162, 'k'], [40, 'l'], [41, 'l'], [193, 'l'], [189, 'l'], [284, 'l'], [181, 'l'], [286, 'k']],
  },
  {
    id: 'browse',
    time: '13:15',
    title: 'Browsing the internet',
    line: 'No camera is needed to know what you read.',
    body: 'A single page view can be recorded by the site, the network, the browser, and third parties at once. The record can follow you even without a cookie.',
    rows: [[105, 'c'], [107, 'c'], [108, 'c'], [113, 'c'], [114, 'c'], [115, 'c'], [116, 'c'], [117, 'c'], [119, 'c'], [120, 'k'], [129, 'c'], [130, 'c'], [131, 'k'], [137, 'k'], [148, 'c'], [282, 'k']],
  },
  {
    id: 'bank',
    time: '15:00',
    title: 'Using financial services',
    line: 'Money moves with a file attached.',
    body: 'Banks analyze transactions and identity. Bureaus keep histories. Scores are derived from both and used for decisions.',
    rows: [[157, 'c'], [158, 'c'], [163, 'c'], [164, 'c'], [165, 'c'], [166, 'c'], [167, 'c'], [146, 'c'], [44, 'k'], [52, 'k'], [67, 'k'], [149, 'k'], [287, 'k']],
  },
  {
    id: 'clinic',
    time: '16:30',
    title: 'Visiting a medical provider',
    line: 'Care produces records far beyond the exam room.',
    body: 'A visit creates clinical, prescription, and billing records. Wearables and apps can hold health data outside traditional medical settings.',
    rows: [[231, 'c'], [232, 'c'], [234, 'c'], [235, 'c'], [233, 'k'], [246, 'k'], [242, 'k'], [239, 'k'], [237, 'k'], [238, 'k'], [243, 'k'], [245, 'k']],
  },
  {
    id: 'watch',
    time: '20:00',
    title: 'Watching something',
    line: 'The screen can watch back.',
    body: 'Streaming services log what you watch. Some connected televisions recognize what is on screen, whatever its source.',
    rows: [[154, 'c'], [156, 'k'], [51, 'k'], [50, 'k'], [155, 'k'], [48, 'k'], [56, 'k'], [118, 'c']],
  },
  {
    id: 'home',
    time: '22:30',
    title: 'Returning home',
    line: 'A house now keeps its own diary.',
    body: 'Doors, thermostats, meters, and appliances can each record when the household is active. Together they describe a routine.',
    rows: [[4, 'k'], [221, 'k'], [218, 'k'], [219, 'k'], [216, 'k'], [217, 'k'], [222, 'k'], [223, 'k'], [224, 'k'], [212, 'l'], [215, 'l'], ['Non-intrusive appliance load monitoring (NILM)', 'l'], ['Wastewater-based epidemiology', 'l'], [220, 'k'], [177, 'c'], [206, 'k']],
  },
];

// Follow the Data. Each step has a stage:
//   collect · link · derive · use
// basis "documented" means the cited line states the step; "illustrative" means the
// step is a plausible example the report does not state.
export const FLOWS = [
  {
    id: 'plate',
    title: 'A license plate',
    lede: 'A car passes a pole-mounted camera.',
    steps: [
      { stage: 'collect', text: 'A camera captures an image of the vehicle and its plate. The spreadsheet lists fixed neighborhood networks and vehicle-mounted fleets as separate deployment models.', rows: [10, 'Fixed neighborhood ALPR networks', 'Mobile municipal ALPR scanning fleets'], line: 37, basis: 'documented' },
      { stage: 'link', text: 'Plate recognition converts the image into searchable structured data: plate, place, and time.', rows: [10], line: 39, basis: 'documented' },
      { stage: 'derive', text: 'Retained across many readers, the records can form a location history rather than only a traffic-enforcement record.', rows: [10, 292], line: 39, basis: 'documented' },
      { stage: 'use', text: 'Records may be searched under the rules of the system that holds them. The report does not document specific search, sharing, or retention rules for any deployment.', rows: [277], line: 343, basis: 'illustrative' },
    ],
  },
  {
    id: 'adid',
    title: 'A mobile advertising ID',
    lede: 'An app with an embedded SDK opens on a phone.',
    steps: [
      { stage: 'collect', text: 'The app’s analytics or ad SDK reports events with a software identifier. With permission, apps can also obtain location.', rows: [127, 126, 128], line: 159, basis: 'documented' },
      { stage: 'link', text: 'The identifier connects events across apps, campaigns, and advertising services.', rows: [126], line: 159, basis: 'documented' },
      { stage: 'derive', text: 'Repeated coordinates become visits, routes, home/work estimates, and audience categories.', rows: [95, 283], line: 129, basis: 'documented' },
      { stage: 'use', text: 'Segments are used for targeting and measurement. Location data can also be sold; the FTC has taken enforcement action over sensitive location data.', rows: [117, 96], line: 129, basis: 'documented' },
    ],
  },
  {
    id: 'loyalty',
    title: 'A loyalty card',
    lede: 'A shopper scans a loyalty number at the register.',
    steps: [
      { stage: 'collect', text: 'The point-of-sale system records the purchase, sometimes item by item.', rows: [159, 157], line: 193, basis: 'documented' },
      { stage: 'link', text: 'The persistent loyalty identifier turns separate trips into one longitudinal purchase history.', rows: [160], line: 195, basis: 'documented' },
      { stage: 'derive', text: 'Behavioral, demographic, and other signals can be used to personalize offers or prices.', rows: [286], line: 359, basis: 'documented' },
      { stage: 'use', text: 'Brokers hold consumer transactions at large scale. The report does not say that any particular loyalty program sells to brokers.', rows: [170], line: 205, basis: 'illustrative' },
    ],
  },
  {
    id: 'credit',
    title: 'A credit file',
    lede: 'Someone pays a bill, opens an account, or misses a payment.',
    steps: [
      { stage: 'collect', text: 'Payment systems and lenders record transactions and account events.', rows: [157], line: 193, basis: 'documented' },
      { stage: 'link', text: 'Financial histories become structured records held by credit bureaus.', rows: [166], line: 201, basis: 'documented' },
      { stage: 'derive', text: 'Automated scoring adds a derived assessment on top of the raw records.', rows: [167], line: 201, basis: 'documented' },
      { stage: 'use', text: 'Scores become inputs to lending and identity decisions.', rows: [167], line: 201, basis: 'documented' },
    ],
  },
  {
    id: 'web',
    title: 'A page view',
    lede: 'A browser loads an article.',
    steps: [
      { stage: 'collect', text: 'The site’s server logs the URL, time, IP address, referrer, and device. Third-party pixels and trackers receive the event too.', rows: [105, 115, 116], line: 149, basis: 'documented' },
      { stage: 'link', text: 'Cookies give sites memory. Fingerprinting can recognize the browser without relying only on a cookie.', rows: [113, 114, 120], line: 155, basis: 'documented' },
      { stage: 'derive', text: 'Identity graphs infer that several devices, cookies, or accounts belong to one person or household.', rows: [282], line: 353, basis: 'documented' },
      { stage: 'use', text: 'Ad systems turn activity into targeting; real-time bidding distributes information about the ad opportunity in milliseconds.', rows: [117, 119], line: 153, basis: 'documented' },
    ],
  },
  {
    id: 'tv',
    title: 'A television',
    lede: 'A connected TV is on in the living room.',
    steps: [
      { stage: 'collect', text: 'Automatic content recognition identifies what is displayed on the screen.', rows: [51], line: 85, basis: 'documented' },
      { stage: 'link', text: 'Recognition results are recorded against the television. The FTC alleged that Vizio collected second-by-second viewing information from millions of TVs.', rows: [156], line: 85, basis: 'documented' },
      { stage: 'derive', text: 'Screen-level data becomes a detailed media-consumption history.', rows: [156, 154], line: 189, basis: 'documented' },
      { stage: 'use', text: 'Viewing data became an advertising and analytics dataset.', rows: [117], line: 189, basis: 'documented' },
    ],
  },
  {
    id: 'face',
    title: 'A face in a crowd',
    lede: 'A person walks past a camera.',
    steps: [
      { stage: 'collect', text: 'A camera records a time-stamped image.', rows: [1], line: 29, basis: 'documented' },
      { stage: 'link', text: 'The face is converted to a biometric representation that can be searched against other images.', rows: [15], line: 45, basis: 'documented' },
      { stage: 'derive', text: 'In live systems the stream is compared with a watchlist in near real time.', rows: [16, 17], line: 47, basis: 'documented' },
      { stage: 'use', text: 'Recognition changes from retrospective identification to continuous screening.', rows: [17], line: 47, basis: 'documented' },
    ],
  },
  {
    id: 'meter',
    title: 'An electricity meter',
    lede: 'A household goes about an ordinary evening.',
    steps: [
      { stage: 'collect', text: 'A smart meter replaces occasional manual readings with fine-grained time-series data.', rows: [212], line: 257, basis: 'documented' },
      { stage: 'link', text: 'Readings are tied to an address or sensor ID.', rows: [215], line: 376, basis: 'documented' },
      { stage: 'derive', text: 'Interval data describes when demand changes inside a household, and can reveal routines and occupancy.', rows: [215, 217], line: 259, basis: 'documented' },
      { stage: 'use', text: 'The report documents what interval data can reveal. It does not document specific downstream uses.', rows: [], line: 259, basis: 'illustrative' },
    ],
  },
  {
    id: 'wifi',
    title: 'A phone in a store',
    lede: 'A shopper walks in with Wi‑Fi switched on.',
    steps: [
      { stage: 'collect', text: 'A phone searching for networks reveals identifiers that sensors can observe.', rows: [192], line: 233, basis: 'documented' },
      { stage: 'link', text: 'MAC addresses can be linked to repeat visits and, in some cases, a named user. The FTC said Nomi observed about nine million devices in nine months of 2013.', rows: [193], line: 233, basis: 'documented' },
      { stage: 'derive', text: 'Observations become dwell time, store paths, and repeat-visit measures.', rows: [284, 285], line: 357, basis: 'documented' },
      { stage: 'use', text: 'Phone makers added identifier randomization, so the same label can describe different methods over time.', rows: [], line: 446, basis: 'documented' },
    ],
  },
];

// The plate-reader context section: systems that can record a single car trip.
export const TRIP = [
  { row: 10, where: 'Roadside', visible: true },
  { row: 'Fixed neighborhood ALPR networks', where: 'Roadside', visible: true },
  { row: 'Mobile municipal ALPR scanning fleets', where: 'Roadside', visible: true },
  { row: 7, where: 'Roadside', visible: true },
  { row: 8, where: 'Intersection', visible: true },
  { row: 9, where: 'Roadside', visible: true },
  { row: 185, where: 'Toll gantry', visible: true },
  { row: 12, where: 'Toll gantry', visible: true },
  { row: 11, where: 'Parking', visible: true },
  { row: 200, where: 'In the car', visible: false },
  { row: 199, where: 'In the car', visible: false },
  { row: 203, where: 'In the car', visible: false },
  { row: 39, where: 'In the car', visible: false },
  { row: 202, where: 'In the car', visible: false },
  { row: 88, where: 'In the phone', visible: false },
  { row: 92, where: 'In the phone', visible: false },
  { row: 126, where: 'In the phone', visible: false },
  { row: 95, where: 'In the phone', visible: false },
  { row: 96, where: 'Downstream', visible: false },
  { row: 'Connected-car data broker feeds', where: 'Downstream', visible: false },
  { row: 'In-car infotainment forensics', where: 'Downstream', visible: false },
  { row: 205, where: 'In the phone', visible: false },
];
