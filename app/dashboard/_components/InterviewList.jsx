"use client";
import { MockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/db";
import InterviewItemCart from "./InterviewItemCart";

function InterviewList() {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      GetInterviewList();
    }
  }, [user]);

  const GetInterviewList = async () => {
    try {
      const result = await db
        .select()
        .from(MockInterview)
        .where(
          eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress)
        )
        .orderBy(desc(MockInterview.id));

      console.log("Interview List:", result);
      setInterviewList(result);
    } catch (error) {
      console.error("Error fetching interview list:", error);
    }
  };

  return (
    <div>
      <h2 className="font-medium text-lg">Previous Mock Interviews</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3">
        {interviewList &&
          interviewList.map((interview, index) => (
            <InterviewItemCart interview={interview} key={index} />
          ))}
      </div>
    </div>
  );
}

export default InterviewList;