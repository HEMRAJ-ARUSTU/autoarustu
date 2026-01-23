import React, { forwardRef } from "react";

const PaymentReceiptPrint = forwardRef(({ data }, ref) => {
    if (!data) return <div ref={ref}></div>;
    

    return (
        <div ref={ref} className="p-10 text-black text-sm w-[800px] mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-sky-500 font-semibold">Annexure 2</h2>
                <h1 className="text-orange-600 font-bold text-lg">
                    Payment Receipt
                </h1>
            </div>

            <div className="border border-gray-600 p-6">
                <div className="grid grid-cols-2 gap-y-4 mb-6">
                    <div>Receipt No : {data.ReceiptNo || data.PaymentID}</div>
                    <div>Date : {data.PaymentDtTm}</div>

                    <div className="col-span-2">
                        Received from : Party #{data.PartyID}
                    </div>

                    <div>Amount Paid : ₹ {data.Amt}</div>
                    <div>Mode of Payment : {data.Paymenttype}</div>
                </div>

                <hr className="border-gray-500 my-6" />

                <div className="grid gap-y-6">
                    <div>Weighbridge No : {data.WeighbridgeNo || "-"}</div>

                    <div>
                        Vendor / Integrator Name & Signature :
                        <div className="mt-6 border-b border-gray-600 w-1/2"></div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default PaymentReceiptPrint;
