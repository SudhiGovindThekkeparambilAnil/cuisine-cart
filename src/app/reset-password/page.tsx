import React, { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPageServer() {
  return (
    <Suspense fallback={<div>Loading reset password form...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
