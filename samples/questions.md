\# Test Question Set



Covers 3 uploaded documents:

\- \*\*Doc A\*\* — `oec\_pec\_application.pdf` (PEC/OEC registration form)

\- \*\*Doc B\*\* — `CMRIT\_Internship\_Placement\_Policy.pdf` (internship/placement policy)

\- \*\*Doc C\*\* — `UDEMY.pdf` (Udemy course completion certificate)



| # | Question | Expected source(s) | Type |

|---|---|---|---|

| 1 | What is the applicant's full name and USN in the registration form? | Doc A | Answerable |

| 2 | What minimum CGPA is required for placement eligibility? | Doc B | Answerable |

| 3 | Who completed the C Programming Bootcamp course, and how long was it? | Doc C | Answerable |

| 4 | What are the applicant's Professional Elective and Open Elective courses? | Doc A | Answerable |

| 5 | By which semester does the policy recommend completing the Professional Elective Course? | Doc B | Answerable |

| 6 | Who is the instructor of the Udemy C programming course, and when was it completed? | Doc C | Answerable |

| 7 | What is the appeal timeline under the grievance redressal process? | Doc B | Answerable |

| 8 | Does the applicant's CGPA meet the placement eligibility requirement described in the policy? | Doc A + Doc B (cross-document synthesis) | Answerable — tests retrieval across two different documents in one answer |

| 9 | What is the hostel fee mentioned in the internship policy? | — | \*\*Deliberately unanswerable\*\* — no hostel fee exists in any document |

| 10 | What programming language other than C is covered in the Udemy certificate? | — | \*\*Deliberately unanswerable\*\* — certificate only covers C |



\## How to run these



```powershell

curl.exe -X POST http://localhost:8000/query -H "Content-Type: application/json" -d '{\\"question\\": \\"<paste question here>\\"}'

```



Run all 10 in order, and save each full JSON response (answer + citations) into `samples/transcript.md`.

