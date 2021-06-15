# Vaccine Scheduler

Scheduler for Vaccine Distribution

---

## Category

**1** - Medical (Doctors, Medical staff, Medical Students)

**2** - Front Line Workers(Police, Army)

**3** - People having serious health issue

**4** - Age >= 45

**5** - Other

---

## Algorithms

- **FCFS** - Scheduled according to registration time.

- **Priority** - Scheduled according to Category and then FCFS.

---

## Data Example

| Name            | Aadhar Card Number | Phone Number | Date Of Birth | Category | Registration Time Stamp |
|-----------------|--------------------|--------------|---------------|----------|-------------------------|
| Chloe Morris    | 4722 6965 3137     | 9463889623   | 02/10/1955    | 2        | 12/05/2021 19:45:39     |
| Johanna Montoya | 5146 7162 7507     | 9373479524   | 18/07/1934    | 3        | 14/05/2021 23:36:55     |
| Mylie Lamb      | 3437 7485 1740     | 9185188559   | 27/08/1930    | 1        | 13/05/2021 09:48:57     |

---

## Score System for Vaccine Distribution 

- Find Maximum Number of Days required for Vaccination if we have 1 vaccine per day.

- Allocate the points in following manner.

---

### Example for Scoring System

- Max number of days **M** = 2000

| Category/Days From Registration | 1     | 2    | 3    | 4    | 5    |
|---------------------------------|-------|------|------|------|------|
| 1                               | 10000 | 8000 | 6000 | 4000 | 2000 |
| 2                               | 9999  | 7999 | 5999 | 3999 | 1999 |
| 3                               | 9998  | 7998 | 5998 | 3998 | 1998 |
| ...                             | ...   | ...  | ...  | ...  | ...  |
| 1998                            | 8003  | 6003 | 4003 | 2003 | 3    |
| 1999                            | 8002  | 6002 | 4002 | 2002 | 2    |
| 2000                            | 8001  | 6001 | 4001 | 2001 | 1    |

- Summing individual squared scores and take root of whole sum.