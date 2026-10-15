# Reconstructed Surveillance Media Dataset

## Executive summary

I reconstructed the missing surveillance CSV from the supplied Deep Research Markdown report. The result contains **292 data rows and exactly three columns**:

1. `The medium`
2. `Its purpose`
3. `The year of implementation`

The reconstruction follows the report's own scope. A medium qualifies when it can create a persistent or queryable observation about a person, device, vehicle, household, transaction, communication, or environment. The report also says that its year field means the earliest practical introduction or documented deployment of the modern form, not necessarily the invention date. It uses approximate dates where deployment occurred in stages and `pre-1975` for important systems that predate the main time window. fileciteturn0file0

The important limitation is that the original CSV itself was **not embedded in the Markdown**. The report states that the original inventory contained 292 media or mechanisms, but its prose groups many of them into combined paragraphs. I therefore split those combined paragraphs into separate media until all distinct concepts supported by the report were represented as 292 rows. This is a constrained reconstruction, not a claim that the recovered row boundaries are byte-for-byte identical to the lost CSV. fileciteturn0file0

Several important anchor dates were independently checked against primary sources. NIST states that FERET began in September 1993. The FBI places IAFIS in July 1999 and the first NGI increment in February 2011. FBI sources place the CODIS pilot in 1990 and NDIS implementation in October 1998. AWS announced CloudTrail on November 13, 2013. USGS places Landsat 1 on July 23, 1972. citeturn9search3turn9search14turn11search0turn11search3turn9search1turn9search0

The date policy is deliberately conservative. There are **31 exact single-year anchors**, **220 approximate dates**, **28 `pre-1975` entries**, **9 `unknown` entries**, **3 staged non-approximate date fields**, and **1 approximate staged field**. Approximate values should be treated as historical placement, not as proof that no earlier deployment existed.

### Downloads

**[Download the reconstructed 292-row CSV](sandbox:/mnt/data/surveillance_media_1975_2026_reconstructed.csv)**

**[Download the exhaustive 292-row source-map annex, including the complete CSV](sandbox:/mnt/data/surveillance_reconstruction_inventory.md)**

## Reconstruction and date controls

The strongest exact dates survive well under primary-source checking. NIST explicitly says the FERET program started in September 1993. citeturn9search3 The FBI says IAFIS automation began in July 1999 and NGI's first increment was deployed in February 2011. citeturn9search14 The FBI also says CODIS began as a pilot in 1990 and that NDIS became operational in October 1998. citeturn11search0turn11search3

The web-tracking timeline also supports the report's distinction between invention and formal standards. RFC 2109, published in February 1997, standardized an HTTP state-management mechanism while explicitly referring to the earlier Netscape cookie implementation. That supports using approximately 1994 for the introduction of HTTP cookies and 1997 when referring specifically to the standards-track protocol. citeturn12search0

Bluetooth Low Energy has a clean 2010 anchor from the Bluetooth SIG. citeturn12search2 AWS has a clean 2013 CloudTrail launch date. citeturn9search1 Apple placed the first Apple Watch on sale on April 24, 2015 and described its heart-rate sensor and fitness functions. citeturn10search4turn10search0

Some technologies have no useful single global start date. Vehicle event data recorders are a good example. NHTSA documents crash-data recorders in the early 1990s and states that General Motors began producing 1994-model-year vehicles that recorded crash severity; later models added pre-crash data. The CSV therefore uses 1994 as a practical modern anchor, not as the invention of all vehicle recording. citeturn13search0

The same caution applies to drones. The report uses about 2005 as a civil-aviation anchor. The FAA identifies 2005 as the year of the first airworthiness certificate for a civil unmanned aircraft. This is not a claim that unmanned aerial surveillance began in 2005. citeturn14search2

Direct-to-consumer genetics also has several possible starting points. NHGRI records mail-order genetic testing in 1996, first DTC companies in 2005, and consumer DTC genetic testing at the $1,000 level in 2007. I retained 2007 because that is the operational consumer milestone selected by the supplied report. citeturn13search1

The commercial-tracking dates are similarly use-specific. The FTC states that Vizio began automatic viewing tracking in 2014. It also states that Nomi observed about nine million mobile devices in the first nine months of 2013 through Wi-Fi MAC-address sensing and used those observations for visits, dwell time, and repeat-customer analytics. citeturn14search1turn14search0

## Sample of the first rows

| The medium | Its purpose | The year of implementation |
|---|---|---|
| Fixed public CCTV | Create time-stamped public-space visual records of presence, movement, companions, vehicles, and events. | pre-1975 |
| Private-business CCTV | Retain visual records for security, loss prevention, safety, and disputes. | pre-1975 |
| Residential security cameras | Observe doorways, property, corridors, and nearby spaces. | approx. 1990s |
| Video doorbell cameras | Observe doorways, sidewalks, visitors, and nearby activity. | approx. 2013 |
| Police dash cameras | Create mobile video and audio records associated with police vehicles. | unknown |
| Police body-worn cameras | Create mobile video and audio records associated with officers. | 2005 |
| Traffic cameras | Record vehicle presence and often time, direction, speed, or plate data. | unknown |
| Red-light cameras | Record vehicles and violations at controlled intersections. | unknown |
| Speed cameras | Measure and record vehicles for automated speed enforcement. | unknown |
| ANPR/ALPR | Convert plate images into searchable plate, place, and time records. | approx. 1970s |
| Parking plate recognition | Record vehicle entry, exit, parking, or enforcement events from plates. | approx. 2000s |
| Toll plate recognition | Identify vehicles for toll billing and crossing records. | approx. 2000s |
| CCTV video analytics | Automatically detect, count, classify, or track people and objects. | approx. 2000s |
| Multi-camera trajectory reconstruction | Reconstruct movement across multiple camera observations. | approx. 2000s |
| Facial recognition | Convert faces into biometric representations and compare them with other images. | 1993 |
| Live facial recognition | Compare live camera feeds with face references in near real time. | approx. 2010s |
| Face watchlists | Alert when observed faces may match selected reference identities. | approx. 2010s |
| Social-network facial recognition | Link recurring faces across social or personal images. | approx. 2010 |
| Photo face clustering | Group images that appear to contain the same person. | approx. 2010s |
| Reverse image search | Find visually similar images across files or online contexts. | approx. 2000s |

The 1993 facial-recognition anchor is directly supported by NIST's FERET history. citeturn9search3 The 2005 body-camera date comes from the report's cited early police experiments and should be read as an early documented operational anchor rather than the invention of portable police video. fileciteturn0file0

## Exhaustive row-to-source inventory

The line references below point to the supplied `deep-research-report.md`. Multiple rows can map to one paragraph because the report frequently describes several distinct media in one combined paragraph. This split is the main mechanism used to reconstruct the original stated total of 292. fileciteturn0file0

- **001. Fixed public CCTV** → line 29, “Fixed public CCTV.”
- **002. Private-business CCTV** → line 31, “Private-business CCTV.”
- **003. Residential security cameras** → line 33, “Residential and doorbell cameras.”
- **004. Video doorbell cameras** → line 33, “Residential and doorbell cameras.”
- **005. Police dash cameras** → line 35, “Police dash cameras and body cameras.”
- **006. Police body-worn cameras** → line 35, “Police dash cameras and body cameras.”
- **007. Traffic cameras** → line 37, “Traffic cameras, red-light cameras, and speed cameras.”
- **008. Red-light cameras** → line 37, same paragraph.
- **009. Speed cameras** → line 37, same paragraph.
- **010. ANPR/ALPR** → line 39, “ANPR/ALPR.”
- **011. Parking plate recognition** → line 41, “Parking and toll plate recognition.”
- **012. Toll plate recognition** → line 41, same paragraph.
- **013. CCTV video analytics** → line 43, “Computer-vision analytics on CCTV.”
- **014. Multi-camera trajectory reconstruction** → line 43, same paragraph.
- **015. Facial recognition** → line 45, “Facial recognition.”
- **016. Live facial recognition** → line 47, “Live facial recognition and face watchlists.”
- **017. Face watchlists** → line 47, same paragraph.
- **018. Social-network facial recognition** → line 49, “Social-network facial recognition and photo clustering.”
- **019. Photo face clustering** → line 49, same paragraph.
- **020. Reverse image search** → line 51, “Reverse image search and perceptual image matching.”
- **021. Perceptual image matching** → line 51, same paragraph.
- **022. Gait recognition** → line 53, “Gait, pose, and body-shape analysis.”
- **023. Pose estimation** → line 53, same paragraph.
- **024. Body-shape analysis** → line 53, same paragraph.
- **025. Thermal imaging** → line 55, “Thermal and temperature imaging.”
- **026. Temperature screening** → line 55, same paragraph.
- **027. Depth cameras** → line 57, “Depth cameras and LiDAR.”
- **028. LiDAR sensing** → line 57, same paragraph.
- **029. Millimeter-wave body scanners** → line 59, “Security body scanners.”
- **030. Backscatter body scanners** → line 59, same paragraph.
- **031. Aerial photography** → line 61, “Aerial photography, helicopter surveillance, and drones.”
- **032. Helicopter surveillance** → line 61, same paragraph.
- **033. Drone surveillance** → line 61, same paragraph.
- **034. Persistent wide-area aerial surveillance** → line 63, “Persistent wide-area aerial observation.”
- **035. Satellite remote sensing** → line 65, “Satellite remote sensing.”
- **036. Commercial high-resolution satellite imaging** → line 67, “Commercial high-resolution satellite imaging and street imagery.”
- **037. Street-level panoramic imagery** → line 67, same paragraph.
- **038. In-vehicle cameras** → line 69, “In-vehicle cameras and driver monitoring.”
- **039. Driver monitoring systems** → line 69, same paragraph.
- **040. Retail shelf cameras** → line 71, “Retail shelf cameras and cashierless vision.”
- **041. Cashierless computer vision** → line 71, same paragraph.
- **042. Wiretaps** → line 75, “Wiretaps and call-content interception.”
- **043. Call-content interception** → line 75, same paragraph.
- **044. Call recording** → line 77, “Call recording and voicemail.”
- **045. Voicemail** → line 77, same paragraph.
- **046. Gunshot detection** → line 79.
- **047. Public microphone networks** → line 81, “General public microphone networks.”
- **048. Voice assistants** → line 83, “Voice assistants and smart speakers.”
- **049. Smart speakers** → line 83, same paragraph.
- **050. Smart-TV microphones** → line 85, “Smart-TV microphones and automatic content recognition.”
- **051. Automatic content recognition (ACR)** → line 85, same paragraph.
- **052. Voiceprints** → line 87, “Voiceprints and speaker recognition.”
- **053. Speaker recognition** → line 87, same paragraph.
- **054. Speech sentiment analysis** → line 89, “Speech sentiment and emotion analysis.”
- **055. Speech emotion analysis** → line 89, same paragraph.
- **056. Ultrasonic device linkage** → line 91, “Ultrasonic and ambient-audio device linkage.”
- **057. Ambient-audio device linkage** → line 91, same paragraph.
- **058. Fingerprint databases** → line 95, “Fingerprint databases and AFIS.”
- **059. AFIS** → line 95, same paragraph.
- **060. IAFIS** → line 97, “IAFIS and NGI.”
- **061. NGI** → line 97, same paragraph.
- **062. Iris recognition** → line 99, “Iris, retina, palm, hand geometry, and vascular biometrics.”
- **063. Retina recognition** → line 99, same paragraph.
- **064. Palm biometrics** → line 99, same paragraph.
- **065. Hand geometry** → line 99, same paragraph.
- **066. Vascular/vein biometrics** → line 99, same paragraph.
- **067. Keystroke dynamics** → line 101, “Behavioral biometrics.”
- **068. Mouse dynamics** → line 101, same paragraph.
- **069. Touch-gesture biometrics** → line 101, same paragraph.
- **070. Eye tracking** → line 103, “Eye and pupil tracking.”
- **071. Pupil tracking** → line 103, same paragraph.
- **072. Heart-rate sensing** → line 105, “Heart and ECG signals.”
- **073. ECG sensing** → line 105, same paragraph.
- **074. Face-based emotion inference** → line 107.
- **075. Border biometric screening** → line 109, “Border and airport biometrics.”
- **076. Airport biometric screening** → line 109, same paragraph.
- **077. Biometric e-gates** → line 109, same paragraph.
- **078. Biometric passports** → line 109, same paragraph.
- **079. Face-based boarding** → line 109, same paragraph.
- **080. CODIS** → line 111, “Forensic DNA databases.”
- **081. NDIS** → line 111, same paragraph.
- **082. Direct-to-consumer DNA testing** → line 113, “Consumer DNA and genetic genealogy.”
- **083. Genetic genealogy** → line 113, same paragraph.
- **084. Call detail records** → line 117.
- **085. SMS metadata** → line 119, “SMS/MMS metadata and retained content.”
- **086. MMS metadata** → line 119, same paragraph.
- **087. Retained SMS/MMS content** → line 119, same paragraph.
- **088. Cell-site location information (CSLI)** → line 121.
- **089. Cell-tower triangulation** → line 123, “Cell-tower triangulation and network positioning.”
- **090. Cellular network positioning** → line 123, same paragraph.
- **091. Wireless E911 location** → line 125, “Wireless E911.”
- **092. Handset GPS** → line 127, “Handset GPS, assisted GPS, and carrier location services.”
- **093. Assisted GPS (A-GPS)** → line 127, same paragraph.
- **094. Carrier location services** → line 127, same paragraph.
- **095. Location history services** → line 129, “Location history and location-data brokers.”
- **096. Location-data brokers** → line 129, same paragraph.
- **097. IMSI catchers** → line 131, “IMSI catchers and cell-site simulators.”
- **098. Cell-site simulators** → line 131, same paragraph.
- **099. SIM registries** → line 133, “SIM, IMEI, and subscriber registries.”
- **100. IMEI registries** → line 133, same paragraph.
- **101. Subscriber registries** → line 133, same paragraph.
- **102. SS7 signaling records** → line 135, “SS7, signaling, roaming, and 5G location records.”
- **103. Roaming records** → line 135, same paragraph.
- **104. 5G location records** → line 135, same paragraph.
- **105. Web-server logs** → line 139, “Web-server and browser history logs.”
- **106. Browser history logs** → line 139, same paragraph.
- **107. ISP connection logs** → line 141, “ISP and DNS records.”
- **108. DNS query logs** → line 141, same paragraph.
- **109. Deep packet inspection** → line 143.
- **110. Enterprise proxy logs** → line 145, “Enterprise proxies, VPN logs, and TLS interception.”
- **111. VPN logs** → line 145, same paragraph.
- **112. TLS interception** → line 145, same paragraph.
- **113. HTTP cookies** → line 147, “Cookies.”
- **114. Third-party cookies** → line 149, “Third-party cookies, pixels, and trackers.”
- **115. Tracking pixels** → line 149, same paragraph.
- **116. Third-party web trackers** → line 149, same paragraph.
- **117. Advertising networks** → line 151, “Advertising networks and targeted advertising.”
- **118. Targeted advertising** → line 151, same paragraph.
- **119. Real-time bidding** → line 153.
- **120. Browser fingerprinting** → line 155, “Browser and device fingerprinting.”
- **121. Device fingerprinting** → line 155, same paragraph.
- **122. Canvas fingerprinting** → line 157, “Canvas, WebGL, font, and audio fingerprints.”
- **123. WebGL fingerprinting** → line 157, same paragraph.
- **124. Font fingerprinting** → line 157, same paragraph.
- **125. Audio fingerprinting** → line 157, same paragraph.
- **126. Mobile advertising IDs** → line 159, “Mobile advertising IDs and app SDKs.”
- **127. App analytics/advertising SDKs** → line 159, same paragraph.
- **128. App permission and sensor access** → line 161.
- **129. Search histories** → line 163, “Search histories and clickstreams.”
- **130. Clickstream and engagement logs** → line 163, same paragraph.
- **131. Session replay** → line 165, “Session replay and fine-grained web interaction logs.”
- **132. Fine-grained web interaction logs** → line 165, same paragraph.
- **133. Browser autofill stores** → line 167, “Autofill and password-manager stores.”
- **134. Password-manager stores** → line 167, same paragraph.
- **135. Password breach databases** → line 169, “Password breach and reuse databases.”
- **136. Password reuse databases** → line 169, same paragraph.
- **137. Browser-extension collection** → line 171.
- **138. Email metadata** → line 173.
- **139. Email content scanning** → line 175, “Email content scanning and spam filtering.”
- **140. Spam filtering** → line 175, same paragraph.
- **141. Cloud backups** → line 177, “Cloud backups and synchronization.”
- **142. Cloud synchronization** → line 177, same paragraph.
- **143. Cloud audit logs** → line 179.
- **144. CDN access logs** → line 181, “CDN, object-access, authentication, and SSO logs.”
- **145. Object-access logs** → line 181, same paragraph.
- **146. Authentication logs** → line 181, same paragraph.
- **147. SSO logs** → line 181, same paragraph.
- **148. Bot-detection telemetry** → line 183, “Bot and fraud telemetry.”
- **149. Fraud-detection telemetry** → line 183, same paragraph.
- **150. Social-media activity and geotag logs** → line 185, “Social-media logs, scraping, sentiment, and geotags.”
- **151. Social-media scraping and sentiment analysis** → line 185, same paragraph.
- **152. EXIF metadata** → line 187, “EXIF and photo metadata.”
- **153. Photo GPS metadata** → line 187, same paragraph.
- **154. Streaming viewing logs** → line 189, “Streaming and television viewing logs.”
- **155. Set-top-box viewing logs** → line 189, same paragraph.
- **156. Smart-TV viewing logs** → line 189, same paragraph.
- **157. Card transaction records** → line 193, “Card, ATM, and point-of-sale records.”
- **158. ATM transaction/camera records** → line 193, same paragraph.
- **159. Point-of-sale records** → line 193, same paragraph.
- **160. Loyalty-program histories** → line 195.
- **161. E-commerce history** → line 197, “E-commerce history and digital receipts.”
- **162. Digital receipts** → line 197, same paragraph.
- **163. AML transaction monitoring** → line 199, “AML, KYC, and fraud systems.”
- **164. KYC identity records** → line 199, same paragraph.
- **165. Financial fraud monitoring** → line 199, same paragraph.
- **166. Credit bureau files** → line 201, “Credit bureaus and credit scoring.”
- **167. Credit scoring** → line 201, same paragraph.
- **168. Insurance claims records** → line 203, “Insurance claims and telematics.”
- **169. Usage-based insurance telematics** → line 203, same paragraph.
- **170. Data brokers** → line 205.
- **171. People-search services** → line 207, “People-search and background-check services.”
- **172. Background-check services** → line 207, same paragraph.
- **173. Digitized public records** → line 209.
- **174. DMV photo databases** → line 211, “DMV photos and identity records.”
- **175. Driver identity records** → line 211, same paragraph.
- **176. Postal mail imaging** → line 213, “Postal imaging and package scans.”
- **177. Package barcode scans** → line 213, same paragraph.
- **178. RFID inventory tracking** → line 215, “RFID inventory and anti-theft tags.”
- **179. Electronic article surveillance/RFID anti-theft tags** → line 215, same paragraph.
- **180. NFC checkout** → line 217, “NFC and biometric checkout.”
- **181. Biometric checkout** → line 217, same paragraph.
- **182. RFID access cards** → line 221, “RFID access cards and electronic keys.”
- **183. Electronic keys and badges** → line 221, same paragraph.
- **184. Transit smart cards** → line 223.
- **185. Electronic toll transponders** → line 225.
- **186. Bluetooth Classic telemetry** → line 227, “Bluetooth and BLE.”
- **187. Bluetooth Low Energy (BLE)** → line 227, same paragraph.
- **188. Bluetooth beacons** → line 229, “Bluetooth beacons and retail tracking.”
- **189. Bluetooth retail tracking** → line 229, same paragraph.
- **190. Bluetooth item trackers** → line 231, “Bluetooth item trackers and crowdsourced finding networks.”
- **191. Crowdsourced finding networks** → line 231, same paragraph.
- **192. Wi-Fi probe-request tracking** → line 233, “Wi-Fi probe and MAC tracking.”
- **193. Wi-Fi MAC-address tracking** → line 233, same paragraph.
- **194. Wi-Fi association logs** → line 235, “Wi-Fi association and positioning databases.”
- **195. Wi-Fi positioning databases** → line 235, same paragraph.
- **196. Ultra-wideband ranging** → line 237.
- **197. Fleet GPS tracking** → line 239, “Fleet GPS and vehicle telematics.”
- **198. Fleet vehicle telematics** → line 239, same paragraph.
- **199. Connected-car telematics services** → line 241.
- **200. Vehicle event data recorders** → line 243.
- **201. OBD-II telemetry** → line 245, “OBD-II and vehicle diagnostic telemetry.”
- **202. Plug-in GPS/cellular vehicle dongles** → line 245, same paragraph.
- **203. Infotainment history** → line 247, “Infotainment and navigation history.”
- **204. Navigation and paired-device history** → line 247, same paragraph.
- **205. Ride-hailing telemetry** → line 249, “Ride-hailing, delivery, and micromobility telemetry.”
- **206. Delivery-app telemetry** → line 249, same paragraph.
- **207. Micromobility telemetry** → line 249, same paragraph.
- **208. Passenger Name Records (PNR)** → line 251, “Passenger Name Records and advance passenger data.”
- **209. Advance Passenger Information (API)** → line 251, same paragraph.
- **210. ADS-B broadcasts** → line 253, “ADS-B and V2X.”
- **211. V2X broadcasts** → line 253, same paragraph.
- **212. Smart electricity meters** → line 257, “Smart electricity, gas, and water meters.”
- **213. Smart gas meters** → line 257, same paragraph.
- **214. Smart water meters** → line 257, same paragraph.
- **215. Utility interval data** → line 259.
- **216. Smart thermostats** → line 261, “Smart thermostats and occupancy sensors.”
- **217. Home occupancy sensors** → line 261, same paragraph.
- **218. Smart locks** → line 263, “Smart locks and alarm systems.”
- **219. Home alarm systems** → line 263, same paragraph.
- **220. Baby monitors** → line 265, “Baby monitors and home cameras.”
- **221. Home security cameras** → line 265, same paragraph.
- **222. Robot-vacuum mapping** → line 267.
- **223. Smart-appliance telemetry** → line 269, “Smart appliances and general IoT telemetry.”
- **224. General IoT telemetry** → line 269, same paragraph.
- **225. Smart-city environmental sensors** → line 271, “Smart-city environmental sensing.”
- **226. Traffic-flow sensors** → line 271, same paragraph.
- **227. Footfall sensors** → line 273, “Smart-city footfall, parking, and streetlight sensors.”
- **228. Smart parking/streetlight sensors** → line 273, same paragraph.
- **229. Building occupancy systems** → line 275, “Building occupancy and real-time location systems.”
- **230. Real-time location systems (RTLS)** → line 275, same paragraph.
- **231. Electronic health records** → line 279.
- **232. E-prescribing records** → line 281, “E-prescribing and prescription-monitoring databases.”
- **233. Prescription drug monitoring programs** → line 281, same paragraph.
- **234. Health-insurance claims** → line 283, “Claims and pharmacy records.”
- **235. Pharmacy records** → line 283, same paragraph.
- **236. Fitness trackers** → line 285.
- **237. Smartwatches** → line 287.
- **238. Fitness-app sharing** → line 289.
- **239. Continuous glucose monitors** → line 291, “Continuous glucose and connected medical devices.”
- **240. Connected medical devices** → line 291, same paragraph.
- **241. Implant telemetry** → line 293.
- **242. Telehealth platforms** → line 295, “Telehealth.”
- **243. Period-tracking apps** → line 297, “Period, fertility, and mental-health apps.”
- **244. Fertility apps** → line 297, same paragraph.
- **245. Mental-health apps** → line 297, same paragraph.
- **246. Medical imaging systems** → line 299, “Medical imaging and PACS.”
- **247. PACS** → line 299, same paragraph.
- **248. Work email monitoring** → line 303, “Work email and communications monitoring.”
- **249. Work communications monitoring** → line 303, same paragraph.
- **250. Keystroke and mouse monitoring** → line 305, “Keystroke, mouse, screen, and webcam monitoring.”
- **251. Screen and webcam monitoring** → line 305, same paragraph.
- **252. Productivity scores** → line 307.
- **253. Endpoint monitoring** → line 309, “Endpoint and DLP monitoring.”
- **254. Data-loss-prevention (DLP) monitoring** → line 309, same paragraph.
- **255. Employee GPS tracking** → line 311, “Employee GPS and badge tracking.”
- **256. Employee badge tracking** → line 311, same paragraph.
- **257. Warehouse scanner telemetry** → line 313.
- **258. Call-center speech analytics** → line 315.
- **259. Remote exam proctoring** → line 317.
- **260. Learning-management-system analytics** → line 319, “Education-platform analytics.”
- **261. Education platform analytics** → line 319, same paragraph.
- **262. RFID student IDs** → line 321, “RFID/student access systems.”
- **263. Student access-card systems** → line 321, same paragraph.
- **264. FISA electronic surveillance** → line 325, “FISA surveillance.”
- **265. CALEA lawful-intercept capability** → line 327, “CALEA interception capability.”
- **266. NSA post-9/11 bulk telephony metadata collection** → line 329, “Post-9/11 bulk telephony metadata.”
- **267. Section 215 bulk telephony metadata program** → line 329, same paragraph.
- **268. PRISM provider collection** → line 331, “PRISM and Section 702 provider collection.”
- **269. Section 702 provider collection** → line 331, same paragraph.
- **270. Section 702 upstream collection** → line 333.
- **271. Fusion centers** → line 335, “Fusion centers and suspicious-activity systems.”
- **272. Suspicious Activity Reporting systems** → line 335, same paragraph.
- **273. Gang databases** → line 337, “Gang databases and modern watchlists.”
- **274. Government watchlists** → line 337, same paragraph.
- **275. Predictive policing** → line 339.
- **276. Algorithmic criminal-risk scores** → line 341.
- **277. Link analysis** → line 343.
- **278. Geofence warrants** → line 345.
- **279. Reverse search demands** → line 347, “Reverse search/keyword demands.”
- **280. Keyword search warrants/demands** → line 347, same paragraph.
- **281. Government social-media monitoring** → line 349.
- **282. Identity graphs** → line 353.
- **283. Location-derived audience segments** → line 355.
- **284. Dwell-time analytics** → line 357, “Dwell-time and visitation analytics.”
- **285. Visitation analytics** → line 357, same paragraph.
- **286. Surveillance pricing** → line 359.
- **287. Fraud risk scores** → line 361, “Fraud, trust, and insider-risk scores.”
- **288. Trust scores** → line 361, same paragraph.
- **289. Insider-risk scores** → line 361, same paragraph.
- **290. Anomaly detection** → line 363.
- **291. Crowd-density analytics** → line 365, “Crowd-density and trajectory reconstruction.”
- **292. Trajectory reconstruction** → line 365, same paragraph.

## CSV file and validation

The CSV has been validated for the properties that can be tested from the recovered material:

| Check | Result |
|---|---:|
| Data rows | 292 |
| Header rows | 1 |
| Columns | 3 |
| Unique medium names | 292 |
| Empty medium fields | 0 |
| Empty purpose fields | 0 |
| Empty year fields | 0 |
| Exact single-year anchors | 31 |
| Approximate date rows | 220 |
| Approximate staged rows | 1 |
| `pre-1975` rows | 28 |
| `unknown` rows | 9 |
| Other staged-date rows | 3 |

The nine `unknown` entries are **Police dash cameras, Traffic cameras, Red-light cameras, Speed cameras, LiDAR sensing, Public microphone networks, Palm biometrics, Home occupancy sensors, and Surveillance pricing**. I did not force a year into those rows because the supplied report does not provide a sufficiently clear first-use date for the split medium.

The full CSV is downloadable here:

**[surveillance_media_1975_2026_reconstructed.csv](sandbox:/mnt/data/surveillance_media_1975_2026_reconstructed.csv)**

The complete comma-separated content is also preserved in the companion annex:

**[surveillance_reconstruction_inventory.md](sandbox:/mnt/data/surveillance_reconstruction_inventory.md)**

A few validation examples show why the date field should not be interpreted as a simple invention timeline. Landsat has a firm pre-scope 1972 anchor from USGS. citeturn9search0 FERET has a firm 1993 program anchor from NIST. citeturn9search3 IAFIS and NGI have 1999 and 2011 anchors from the FBI. citeturn9search14 CODIS and NDIS have separate 1990 pilot and 1998 national milestones. citeturn11search0turn11search3 AWS CloudTrail has a firm November 2013 launch. citeturn9search1 Vizio's documented viewing-data practice starts in 2014, not at the invention of smart television. citeturn14search1

The original report also makes an important methodological point: the rise in entries over time cannot by itself be treated as a quantitative measure of growth in “total surveillance.” Research coverage, terminology, technological splitting, and the ability to distinguish mechanisms all change over time. fileciteturn0file0

## Next.js import note

For the website, treat the CSV as the canonical three-field source dataset. Do not add fields to the CSV itself.

A useful TypeScript representation is:

```ts
export type SurveillanceMedium = {
  medium: string;
  purpose: string;
  implementationYear: string;
};
```

Do **not** parse `implementationYear` directly as a number. It intentionally contains values such as:

```text
1993
pre-1975
approx. 2000s
approx. 2009–2010
1990 pilot
1998 national
1996 rules; 2001 rollout
approx. 2007; Section 702 from 2008
unknown
```

Load the CSV at build time, map the three source headers into the application names, and keep the original year string intact:

```ts
type CsvRow = {
  "The medium": string;
  "Its purpose": string;
  "The year of implementation": string;
};

function normalizeRow(row: CsvRow): SurveillanceMedium {
  return {
    medium: row["The medium"].trim(),
    purpose: row["Its purpose"].trim(),
    implementationYear: row["The year of implementation"].trim(),
  };
}
```

For timeline positioning, create a **derived value in application code**, not a fourth CSV column. For example, `approx. 2000s` can receive a display position around 2005 while the interface still shows the exact source string `approx. 2000s`. `pre-1975` and `unknown` should receive special timeline states rather than false numeric years.

The website can then maintain richer metadata in a separate source-map file or TypeScript structure. That layer can hold category, report paragraph, citation, date confidence, government/private/mixed classification, related systems, and visualization relationships. The three-column CSV should remain unchanged.

The most important data-design rule is to distinguish **source facts from presentation metadata**. For example, a timeline may place `CODIS` at 1990 and `NDIS` at 1998, but the interface should explain that these represent a pilot and national implementation respectively. The FBI itself makes that distinction. citeturn11search0turn11search3 Likewise, a cookie entry can use approximately 1994 as the practical introduction while an explanatory card notes that RFC 2109 standardized HTTP state management in February 1997. citeturn12search0

## Limitations and reconstruction status

This is a **high-confidence reconstruction of the report's conceptual inventory, but not a forensic recovery of the missing original CSV**.

The source report expressly says that it contains 292 distinct media or mechanisms and that a separate 292-row CSV existed. It also describes many of the exact separations that the CSV was intended to contain, such as public versus private CCTV, Wi-Fi probes versus association logs, raw health sensors versus apps, AFIS versus IAFIS versus NGI, and CODIS pilot versus national NDIS. fileciteturn0file0

What cannot be proven is that the lost CSV split **every combined paragraph in exactly the same way** as this reconstruction. For example, a paragraph that discusses iris, retina, palm, hand geometry, and vascular biometrics can defensibly become five rows, but the missing original could conceivably have grouped two of those mechanisms. The 292-row reconstruction therefore uses the report's stated total as a constraint while refusing to introduce a surveillance concept that is absent from the supplied text.

The date field has the same limitation. Exact dates with strong anchors have been preserved and independently checked where practical. NIST, FBI, USGS, FAA, NHTSA, RFC Editor, Apple, AWS, Bluetooth SIG, FTC, and NHGRI sources support several of the report's most important milestones. citeturn9search3turn9search14turn11search3turn9search0turn14search2turn13search0turn12search0turn10search4turn9search1turn12search2turn14search1turn13search1

For the large number of technologies that developed through research, pilots, multiple vendors, or multiple countries, the reconstruction deliberately uses broad `approx.` values. These values are suitable for an exploratory historical website. They should **not** be presented as claims that the listed decade contains the world's first-ever instance of the technology.

The downloadable source-map annex preserves the mapping from **all 292 CSV rows back to the supplied Markdown paragraphs**, which gives the website agent a clean way to keep the visual experience traceable to the research.