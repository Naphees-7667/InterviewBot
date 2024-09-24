"use client";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModel";
import { LoaderCircle } from "lucide-react";
import { MockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment/moment";

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState();
  const [jobDesc, setJobDesc] = useState();
  const [jobExperience, setJobExperience] = useState();
  const [loading, setloading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const router = useRouter();
  const { user } = useUser();

  const onSubmit = async (e) => {
    setloading(true);
    e.preventDefault();
  
    console.log(jobPosition, jobDesc, jobExperience);
    
    const InputPrompt =
      "Job Position: " +
      jobPosition +
      ", Job Description: " +
      jobDesc +
      ", Years of Experience: " +
      jobExperience +
      ", Depends on this information please give me " +
      process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT +
      " interview questions with Answered in Json Format, Give Question and Answered as field in JSON like Question and Answer as field";
  
    try {
      // Await the response text properly
      const result = await chatSession.sendMessage(InputPrompt);
      const responseText = await result.response.text(); // Use await here
      
      // Clean up the response
      const cleanedResponse = responseText
        .replace("```json", "")
        .replace("```", "");
      
      // Try to parse the cleaned response
      const MockJsonResp = JSON.parse(cleanedResponse);
      console.log("Parsed JSON Response:", MockJsonResp);
      
      setJsonResponse(MockJsonResp);
  
      if (MockJsonResp) {
        const resp = await db
          .insert(MockInterview)
          .values({
            mockId: uuidv4(),
            jsonMockResp: JSON.stringify(MockJsonResp), // Store the JSON response
            jobPosition: jobPosition,
            jobDesc: jobDesc,
            jobExperience: jobExperience,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            createdAt: moment().format("DD-MM-YYYY"),
          })
          .returning({ mockId: MockInterview.mockId });
  
        console.log("Inserted ID:", resp);
  
        if (resp) {
          setOpenDialog(false);
          router.push(`/dashboard/interview/${resp[0].mockId}`);
        }
      }
    } catch (error) {
      console.error("Error during JSON parsing or submission:", error);
    } finally {
      setloading(false);
    }
  };

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg text-center">+Add New</h2>
      </div>

      <Dialog open={openDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Tell us more about Job you are interviewing
            </DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div>
                  <h2>
                    Add Details about your job position, Your skills and Year of
                    experience
                  </h2>

                  <div className="mt-7 my-3">
                    <label>Job Position/Job Role</label>
                    <Input
                      placeholder="Ex. Full Stack Developer"
                      required
                      onChange={(e) => setJobPosition(e.target.value)}
                    />
                  </div>

                  <div className="my-3">
                    <label>Job Description/Tech Stack (In Short)</label>
                    <Textarea
                      placeholder="Ex. React, Angular, NodeJs, Python, MySQL etc"
                      required
                      onChange={(e) => setJobDesc(e.target.value)}
                    />
                  </div>

                  <div className="my-3">
                    <label>Years of Experience</label>
                    <Input
                      placeholder="Ex.5"
                      type="number"
                      max="50"
                      required
                      onChange={(e) => setJobExperience(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-5 justify-end">
                  <Button
                    type="Button"
                    variant="ghost"
                    onClick={() => setOpenDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="Submit" disabled={loading}>
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin" />
                        {"Generating from AI..."}
                      </>
                    ) : (
                      "Start Interview"
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;