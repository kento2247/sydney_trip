Sydney 2026 travel website

Open index.html in a browser or publish this folder as-is on GitHub Pages.
The site is intentionally lightweight: no embedded map library; route links open Google Maps / Transport for NSW / Uber.
Weather uses Open-Meteo when online. Photos are remote Wikimedia thumbnails and most index images lazy-load.
The calendar file is sydney-2026-itinerary.ics and uses Australia/Sydney (AEST/AEDT) timezone definitions.

v3 image fix:
- Replaced invalid thumb.wikimedia.org image references with upload.wikimedia.org.
- Photos are still remote Wikimedia images, so an internet connection is required to display them.


v5 all-stop maps:
- Every day page now contains an embedded OpenStreetMap-based map with numbered pins for all distinct travel stops.
- Pin numbers match the place list under each map. Click a pin or place row to open Google Maps.
- Same-building conference activities on 9/28 are consolidated into the ICC Sydney pin.
- Tokyo arrival airport on 9/30 was not specified in the source itinerary, so no guessed airport pin was added.

v6 day swap (9/27 <-> 9/29):
- Swapped the full itineraries of 9/27 and 9/29: 9/27 is now CBD walk + Manly + Dinner Cruise, 9/29 is now bills / Bondi / Taronga / Royal Botanic Garden / Opera House / dinner.
- Day pages, hero images, notes, ferry alerts, pin maps, index day cards and the .ics were all updated.
- ICS event UIDs were intentionally left unchanged so an already-imported calendar updates the existing entries in place (SEQUENCE bumped to 1). UID date prefixes therefore no longer match the event date.

v7 timing fixes:
- 9/27: reordered for Sunday opening hours. St Mary's Cathedral moved to 12:30 (10:30 Sunday Mass), QVB to 11:00 (Sunday opening), Manly 13:45-16:00 with a 16:00-16:15 departure, Eastern Pontoon 17:15-17:30, boarding 17:45, cruise 18:00-20:00. Pin order follows the new sequence.
- 9/29: The Rover shifted to 16:15-18:00 (20 min from Opera House; Mon-Fri 16:00-24:00, walk-in only, happy hour to 18:00). Kingsleys Tuesday hours 17:30-21:00 noted.
- 9/30: stay departure moved to 05:30, airport arrival 06:00.
- ICS: a separate 18:00-20:00 Dinner Cruise event was added for 9/27 (UID 20260927-cruise); the 17:15 event is now the arrival/meet-up. Modified events got a bumped SEQUENCE.

v8 menu + split-the-bill form:
- The top-right INDEX link was replaced by a hamburger button that opens a right-side drawer (INDEX, all six days, the split-the-bill Google Form, the .ics download). Closes on backdrop click, the X button, Escape, or picking a link.
- Google Form for splitting expenses is linked from the drawer on every page and from QUICK LINKS on index.html.

v9 bookings:
- 9/29: Chophouse Sydney (25 Bligh St) booked 20:30-22:30, added as the last item. Kingsleys was trimmed to 19:00-20:00 so the two do not overlap.
- 9/28: breakfast at Kurtosh - Darling Square (Shop 1, 16 Nicolle Walk, Haymarket) added at 08:30-09:30 as the day's first item; agenda numbers and map pins shifted accordingly.
- 9/28: the 14:30-16:30 slot is now "Show and tell" listening for paper 3571 (Coco-VC, Ryo Kato) and 3577 (audio comic from manga, Sota Koshino), replacing the generic venue-walk entry.

v10 afternoon rework:
- 9/28: Royal Botanic Garden 14:30-16:00 inserted before the Show and tell listening slot, which is now 16:00-16:30 (papers 3571 / 3577). Garden pin added to the day map.
- 9/29: Royal Botanic Garden dropped. Taronga Zoo moved to the start (09:30-11:45, ferry 08:45), Bondi Beach moved to midday (12:45-14:30). Hero and index card images switched to a Bondi Beach photo (DXR, CC BY-SA 4.0) since the garden photo no longer matched the day.
- ICS: the garden event was re-pointed to 9/28 (UID 20260928-garden); a 20260929-ferry event was added for the Taronga crossing.

v11 evening tweak (9/29):
- The Rover moved to 17:00-18:00.
- Chophouse Sydney removed from 9/29 (page, map pin and the 20260929-chophouse ICS event).
- Kingsleys extended back to 19:00-21:00 (Tuesday close).
- Note: removing the Chophouse event from the .ics does not delete it from a calendar that already imported it; delete that entry by hand if so.

v12 beach swap:
- 9/27 now goes to Bondi Beach (bus from the CBD, 14:00-16:00, leave by 16:15 for the 17:45 boarding). The ferry alert banner was removed from 9/27 since the day no longer uses Sydney Ferries.
- 9/29 now goes to Manly (13:15-15:30) via a Circular Quay transfer from Taronga; Opera House shifted to 16:00-16:30 to match the 15:30 return ferry.
- Hero/index images follow: 9/27 card = Bondi (DXR, CC BY-SA 4.0), 9/29 hero + card = Manly (Petesmiles, public domain). Index card titles are now CITY + BONDI and ZOO + MANLY.

v13 (9/27):
- St Mary's Cathedral dropped entirely (page, pin and the ICS event).
- Queen Victoria Building moved to the late afternoon, 15:45-16:45, inside the Sunday 11:00-17:00 window.
- The day now front-loads Bondi (11:00-14:00) and keeps Messina 15:00 before QVB; hero and map headings updated.

v14 beach swap back:
- 9/27 goes to Manly again (F1 from Circular Quay, 11:00-14:00); ferry alert banner restored on that page.
- 9/29 goes to Bondi (13:15-15:15) via Circular Quay and bus after Taronga; Opera House stays 16:00-16:30.
- Hero/card images swapped back: 9/27 card = Manly, 9/29 hero + card = Bondi. Titles MANLY + CITY / ZOO + BONDI.

v15:
- 9/28: Opera Bar 20:30-22:00 added after the Welcome Reception, with a map pin.
- 9/29: Anita Gelato Bondi Beach (180 Campbell Parade) added 14:45-15:15; Bondi Beach now runs 13:15-14:45.

v16 (9/26 trek):
- Reworked around a hard "back at Central by 19:00" constraint. Grand Canyon Track (Blackheath, 3-4h) does not fit and was dropped: the return leg alone puts Central at 18:55 with zero slack on a trackwork day.
- New shape: Central 09:20 -> Katoomba 11:20, Echo Point / Three Sisters 11:30-12:35, Prince Henry Cliff Walk 12:35-14:35, Katoomba Falls 14:35-15:45, Katoomba 16:20 -> Central 18:20, bags 18:30.
- Everything stays inside Katoomba, reachable by bus or on foot, so no Blackheath taxi is needed. Train times are approximate and must be confirmed on Trip Planner.

v17 (9/26 = Grand Canyon):
- Replaced the Katoomba walk with the user's timetabled plan: Central 09:09 -> Blackheath 11:22, taxi to Neates Glen, Grand Canyon Track 11:35-15:00, taxi back, Blackheath 16:03 -> Central 17:17, bags 17:30.
- Echo Point / Three Sisters and Prince Henry Cliff Walk dropped for the day. Pins are now Blackheath Station, Neates Glen and Evans Lookout.
- The source table had the taxi at 11:05-11:15 and the track starting 11:15, both before the 11:22 arrival; shifted to 11:25-11:35 / 11:35 so the sequence is possible.

v18 (9/26 final): Grand Canyon + Echo Point in one day.
- Central 09:09 -> Blackheath 11:22, taxi, Grand Canyon Track 11:35-14:30, taxi 14:35-14:50, Blackheath 15:03 -> Katoomba 15:15, Echo Point 15:30-16:30, Katoomba 17:16 -> Central 19:17, bags 19:20-19:40.
- The source table again had the taxi at 11:02-11:15 and the track starting 11:15, both before the stated 11:22 arrival; the taxi was shifted to 11:25-11:35, which leaves the track 2h55 against an official 3-4h.

v19 schedule + map interaction rework:
- 9/26: Echo Point removed so Grand Canyon Track gets 3h20 and there is a real buffer to collect bags, return to 296 Bulwara Rd, shower/change, and reach the confirmed 20:30 Chophouse booking. Blue Mountains train times are treated as flexible because 9/26 trackwork may change the timetable.
- 9/27: Luna Park Sydney added in the morning; route is now hotel -> Luna Park -> walk across Harbour Bridge -> Circular Quay -> Manly -> Circular Quay / Eastern Pontoon -> Sydney Princess Cruises. Messina/QVB/Surry Hills were removed from this day to avoid zig-zagging and protect the cruise buffer.
- 9/29: Opera House moved to the morning before Taronga; bills moved from Surry Hills to the Bondi Beach branch for lunch; Bondi now goes directly to Surry Hills/The Rover instead of returning to Circular Quay. Confirmed The Rover 17:00-18:00 and Kingsleys 19:00-21:00 are unchanged.
- Map UX: normal wheel/trackpad scrolling no longer zooms maps; touch/trackpad pinch zooms more slowly; + / - controls remain; a fullscreen button was added with a CSS fallback where Fullscreen API is unavailable.
- Google Maps links now live in each schedule row. The link list under every map was removed, and map pins are visual only.
