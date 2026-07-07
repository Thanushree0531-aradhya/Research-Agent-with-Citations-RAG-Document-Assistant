\# Sample Run Transcript



Captured from the actual running backend (`localhost:8000`) with 3 documents uploaded:

\- `oec\_pec\_application.pdf`

\- `CMRIT\_Internship\_Placement\_Policy.pdf`

\- `UDEMY.pdf`



(A 4th document, `convocation\_fee.pdf`, was also present in the vector store during these runs and occasionally appears as a low-scoring, irrelevant citation — see Known Limitations in the README.)



\---



\### Q1: What is the applicant's full name and USN in the registration form?



\*\*Answer:\*\* The applicant's full name is Thanushree T and her USN is 1CR22CI057, as per her registration form \[1].



\*\*Citations:\*\*

\- \[1] `oec\_pec\_application.pdf`, page 1, score 0.2426 — Personal Information block

\- \[2] `oec\_pec\_application.pdf`, page 2, score 0.1687

\- \[3] `CMRIT\_Internship\_Placement\_Policy.pdf`, page 3, score 0.0956

\- \[4] `convocation\_fee.pdf`, page 1, score 0.0927 \*(low-relevance noise — see limitations)\*

\- \[5] `CMRIT\_Internship\_Placement\_Policy.pdf`, page 1, score 0.0923



✅ Correct. Also demonstrates that citation index ≠ page number (\[1]/\[2] both from the same doc, different pages).



\---



\### Q2: What minimum CGPA is required for placement eligibility?



\*\*Answer:\*\* To be eligible for placement through the campus recruitment process, a student must maintain a minimum CGPA of 6.5 at the time of application \[1]. Students with a CGPA between 6.0 and 6.5 may be considered case-by-case, subject to HOD approval \[1]. Reservation category candidates are eligible for relaxed CGPA thresholds per Karnataka state guidelines \[1].



\*\*Citations:\*\*

\- \[1] `CMRIT\_Internship\_Placement\_Policy.pdf`, page 1, score 0.4759 — Eligibility Criteria section

\- \[2]–\[5] additional lower-scoring chunks from the same document



✅ Correct, well-grounded, highest-relevance chunk correctly identified.



\---



\### Q3: Who completed the C Programming Bootcamp course, and how long was it?



\*\*Answer:\*\* The C Programming Bootcamp course was completed by someone who received a certificate with reference number 0005, and the course was 44 total hours long, instructed by Vlad Budnitski and Devika G \[1].



\*\*Citations:\*\*

\- \[1] `UDEMY.pdf`, page 1, score 0.5017 — full certificate text



⚠️ \*\*Partially incorrect\*\* — the model misattributes "Devika G" as a co-instructor. She is actually the student who completed the course. See "Known Limitations" below for root cause.



\---



\### Q4: What are the applicant's Professional Elective and Open Elective courses?



\*\*Answer:\*\* The applicant's Professional Elective Course is Privacy and Security in online Social Media, and the Open Elective Course is Understanding Incubation and Entrepreneurship, each carrying three credits \[3].



\*\*Citations:\*\*

\- \[1] `CMRIT\_Internship\_Placement\_Policy.pdf`, page 2, score 0.4851

\- \[2] `CMRIT\_Internship\_Placement\_Policy.pdf`, page 3, score 0.4192

\- \[3] `oec\_pec\_application.pdf`, page 2, score 0.3732 — actual source of the answer

\- \[4], \[5] additional lower-scoring context chunks



✅ Correct — note the model correctly pulled the applicant-specific answer from citation \[3] (the application form) rather than the similarly-worded policy document, despite the policy doc chunks scoring higher.



\---



\### Q5: By which semester does the policy recommend completing the Professional Elective Course?



\*\*Answer:\*\* The policy strongly recommends completing the Professional Elective Course by the end of semester seven \[1], to avoid scheduling conflicts with final-year project work.



\*\*Citations:\*\*

\- \[1] `CMRIT\_Internship\_Placement\_Policy.pdf`, page 3, score 0.4524 — Credit Requirements section



✅ Correct.



\---



\### Q9 (ran earlier as a general test): What is the applicant's blood group?



\*\*Answer:\*\* I could not find relevant information in the uploaded documents.



\*\*Citations:\*\* none



✅ Correct fallback behavior — no blood group field exists in any document; the agent correctly declines to guess.



\---



\## Summary



| # | Result |

|---|---|

| Retrieval accuracy | 5/5 factual questions correctly grounded in the right document |

| Citation correctness | Source + page number correctly attributed in all cases |

| Index ≠ page number proven | Yes — confirmed in Q1 and across multiple multi-chunk answers |

| Cross-document discrimination | Yes — Q4 correctly preferred the applicant-specific document over a similarly-worded policy document despite lower similarity score |

| "Not found" fallback | Confirmed working — no hallucination on out-of-scope questions |

| Known failure case found | Yes — Q3 shows a real name-attribution error, documented below |



\## Known Limitation Surfaced By This Test



\*\*No relevance threshold on retrieval.\*\* The agent always returns exactly `top\_k=5` chunks regardless of actual relevance, so low-scoring, unrelated chunks (e.g. from `convocation\_fee.pdf`, a payment receipt) sometimes appear as citations on unrelated questions (see Q1, citation \[4], score 0.09). This doesn't corrupt the \*answer\* text — the LLM correctly ignores irrelevant context when generating the response — but it does clutter the citations list with noise. A similarity-score cutoff (e.g. discard anything below \~0.15) would fix this with more time.



\*\*Layout-blind text extraction can misattribute unlabeled fields.\*\* In Q3, the Udemy certificate's recipient name ("Devika G") has no explicit label ("Student:", "Awarded to:") in the extracted text — it simply appears directly after "Instructor Vlad Budnitski" in reading order. Because the RAG pipeline sees only flattened text with no positional/layout information, the LLM merged the two names into "instructed by Vlad Budnitski and Devika G," incorrectly making the recipient a co-instructor. A layout-aware extraction step (e.g. preserving bounding boxes, or a vision-based extraction pass) would fix this, but was out of scope for the 24-hour window.

