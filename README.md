# Corsi-Block-Task
Corsi Block Task in jsPsych


****************************** 
*   Notes   * 
*   **************************


This piece of code is revised by Dr Jian Chen based on the published code from R. Gibeau (2021) The Corsi Blocks Task: Variations and coding with jsPsych. The Quantitative Methods for Psychology. 10.20982/tqmp.17.3.p299

In this version, Dr Jian Chen follows the classical Corsi task in which 9 sequences are presented in a fixed order. Blocks are presented in fixed positions. For each sequence has two trials. Participants need to pass at least one trial to get to the next sequence. 

Please notice, given this piece code is based on a exisiting task, so some code look dumb here and there. There are better ways to achieve this but for the moment this is the most time efficient way for me. I will look into the possibility to recode it into a more neat way using the newest version of jsPsych.

This task runs in jsPsych v6.1.0. It does not work in other versions.

- 25.7.2022 add termination if two continuous errors in one sequence. 
