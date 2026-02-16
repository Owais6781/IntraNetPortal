


import * as React from "react";
import { useState } from "react";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";

 import { Upload, } from "lucide-react";

interface OnboardingProps {
    sp: SPFI;
}


interface FormDat {
    id?: number;
    firstName: string;
    lastName: string;
    fatherName: string;
    motherName: string;
    dob: string;
    mobile: string;
    email: string;
    jobrole: string;
    presentAddress: string;
    permenentAddress: string;
    companyName: string;
    compantAddress: string;
    department: string;
    refrencename: string;
    number: string;
    educationDoc:File |null;
    identityDoc:File|null;

}

const RegistationForm: React.FC<OnboardingProps> = ({ sp }) => {

    const initialize: FormDat = {
        firstName: "",
        lastName: "",
        fatherName: "",
        motherName: "",
        dob: "",
        mobile: "",
        email: "",
        jobrole: "",
        presentAddress: "",
        permenentAddress: "",
        companyName: "",
        compantAddress: "",
        department: "",
        refrencename: "",
        number: "",
        educationDoc:null,
        identityDoc:null,

    }

    const [formData, setFormData] = useState<FormDat>(initialize);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;

        if (files) {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };




    // const UploadDocument = async (empId: string, file: File, docCategory: string) => {

    //     const libararyName = "DocumentOnboarding";

    //      console.log(libararyName)

    //     const folder = await sp.web.lists
    //         .getByTitle(libararyName).rootFolder.folders.addUsingPath(empId)

    //          console.log(folder)

    //     const upload = await folder.folder.files.addUsingPath(  file.name,  file,{ Overwrite: true }
    //     );

    //     const item = await upload.file.getItem();
    //     await item.update({
    //         DocumentCategoray: docCategory,
    //         EmployeeId: empId
    //     })

    // }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(formData);
        try {

            const item = await sp.web.lists.getByTitle("Onboarding")
                .items.select("Title").orderBy("Id", false).top(1)()

            let customNumber = 1
            const currentYear = new Date().getFullYear()
            if (item.length > 0) {
                const lastItem = item[0].Title
                if (lastItem && lastItem.startsWith("EMP")) {
                    const lastid = lastItem.split("-")
                    if (lastid.length === 2) {
                        const lastyear = parseInt(lastid[0].substring(3), 10)
                        const lastnumber = parseInt(lastid[1], 10)
                        if (currentYear && lastyear && lastnumber > 0) {
                            customNumber = lastyear === currentYear ? lastnumber + 1 : 1;
                        }
                    }
                }

                const customId = `EMP${currentYear}-${String(customNumber).padStart(3, '0')}`

                await sp.web.lists.getByTitle("Onboarding").items.add({
                    Title: customId,
                    FirstName: formData.firstName,
                    LastName: formData.lastName,
                    FatherName: formData.fatherName,
                    MotherName: formData.motherName,
                    DateofBirth: formData.dob,
                    Mobile: formData.mobile,
                    Email: formData.email,
                    JobRole: formData.jobrole,
                    PresentAddress: formData.presentAddress,
                    PermanentAddress: formData.permenentAddress,
                    CompanyName: formData.companyName,
                    CompanyAddress: formData.compantAddress,
                    Department: formData.department,
                    ReferenceName: formData.refrencename,
                    ReferenceNumber: formData.number
                })

                // if(formData.educationDoc){
                //     await UploadDocument(customId,formData.educationDoc,"Education")
                // }
                
                //    if(formData.identityDoc){
                //     await UploadDocument(customId,formData.identityDoc,"Identity")
                // }
                setFormData(initialize);

            }


            alert("Form submitted successfully ✅");
        } catch (error) {
            console.log(error);
        }
    }

    const educationDocuments = [
        { label: "10th Marksheet", name: "marksheet10" },
        { label: "12th (10+2) Marksheet", name: "marksheet12" },
        { label: "Graduation Certificate", name: "graduation" },
        { label: "Post Graduation Certificate", name: "postGraduation" },
        { label: "Resume", name: "resume" },
        { label: "Experience Certificate", name: "experienceCertificate" },
    ];

    const identityDocuments = [
        { label: "Photograph", name: "photo" },
        { label: "Pan Card", name: "panCard" },
        { label: "Aadhaar Card / Passport", name: "aadhaarPassport" },
        { label: "Voter Card", name: "voterCard" },

    ];


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-3xl"
            >
                <h2 className="text-3xl font-semibold text-center mb-8">
                    Personal Details
                </h2>

                {/* Row 1: First & Last Name */}
                <div className=" border rounded-2xl p-4 bg-white">
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Father Name</label>
                            <input
                                type="text"
                                name="fatherName"
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Mother Name</label>
                            <input
                                type="text"
                                name="motherName"
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>
                    </div>


                    {/* Row 2: DOB & Mobile */}
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Date of Birth</label>
                            <input
                                type="date"
                                name="dob"
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Mobile Number</label>
                            <input
                                type="number"
                                name="mobile"
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Job Role</label>
                            <input
                                type="text"
                                name="jobRole"
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Present Address</label>
                            <input
                                type="text"
                                name="presentAddress"
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Permanent Address</label>
                            <input
                                type="text"
                                name="permanentAddress"
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>
                    </div>

                </div>

                <div className=" border rounded-2xl p-4 mt-4 bg-white">
                    <h3 className="text-md font-semibold mb-4 text-gray-800">
                        Last Organization Informetion
                    </h3>
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Company Name</label>
                            <input
                                type="text"
                                name="companyName"
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Company Address</label>
                            <input
                                type="text"
                                name="companyAddress"
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Job Role</label>
                            <input
                                type="text"
                                name="jobRole"
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Department</label>
                            <input
                                type="text"
                                name="department"
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Refrence Name</label>
                            <input
                                type="text"
                                name="referenceName"
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Number</label>
                            <input
                                type="number"
                                name="number"
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>
                    </div>
                </div>


                {/* Documents */}
                {/* <div className="flex flex-col md:flex-row gap-6 mb-8  mt-4 border rounded-2xl p-4 bg-white">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">
                            Education Document
                        </label>

                        <label className="flex items-center justify-center gap-2 cursor-pointer
                    border-2 border-dashed rounded-xl px-4 py-3
                    bg-gray-50 hover:bg-gray-100 transition">
                            <Upload size={18} className="text-indigo-500" />
                            <span className="text-sm font-medium text-gray-700">
                                Upload Document
                            </span>

                            <input
                                type="file"
                                name="educationDoc"
                                onChange={handleChange}
                                className="hidden"
                                required
                            />
                        </label>
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">
                            Identity Document
                        </label>

                        <label className="flex items-center justify-center gap-2 cursor-pointer
                    border-2 border-dashed rounded-xl px-4 py-3
                    bg-gray-50 hover:bg-gray-100 transition">
                            <Upload size={18} className="text-indigo-500" />
                            <span className="text-sm font-medium text-gray-700">
                                Upload Document
                            </span>

                            <input
                                type="file"
                                name="educationDoc"
                                onChange={handleChange}
                                className="hidden"
                                required
                            />
                        </label>
                    </div>
                </div> */}


                <div className="mt-4 border rounded-2xl p-4 bg-white">

                    <h3 className="text-md font-semibold mb-4 text-gray-800">
                        Education Documents
                    </h3>

                    <div className="flex flex-wrap gap-4 mb-6">
                        {educationDocuments.map((doc) => (
                            <div key={doc.name} className="w-full md:w-[48%]">
                                <label className="block text-sm font-medium mb-2">
                                    {doc.label}
                                </label>

                                <label
                                    className="flex items-center justify-center gap-2 cursor-pointer
                                     border-2 border-dashed rounded-xl px-4 py-3
                                      bg-gray-50 hover:bg-gray-100 transition"
                                >
                                    <Upload size={18} className="text-indigo-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Upload {doc.label}
                                    </span>

                                    <input
                                        type="file"
                                        name={doc.name}
                                        onChange={handleChange}
                                        className="hidden"
                                        required
                                    />
                                </label>
                            </div>
                        ))}
                    </div>


                    <h3 className="text-md font-semibold mb-4 text-gray-800">
                        Identity Documents
                    </h3>

                    <div className="flex flex-wrap gap-4">
                        {identityDocuments.map((doc) => (
                            <div key={doc.name} className="w-full md:w-[48%]">
                                <label className="block text-sm font-medium mb-2">
                                    {doc.label}
                                </label>

                                <label
                                    className="flex items-center justify-center gap-2 cursor-pointer
                                     border-2 border-dashed rounded-xl px-4 py-3
                                     bg-gray-50 hover:bg-gray-100 transition"
                                >
                                    <Upload size={18} className="text-indigo-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Upload {doc.label}
                                    </span>

                                    <input
                                        type="file"
                                        name={doc.name}
                                        onChange={handleChange}
                                        className="hidden"
                                        required
                                    />
                                </label>
                            </div>
                        ))}
                    </div>

                </div>



                {/* Submit */}
                <div className="flex justify-center mt-2">




                    <button
                        type="submit"
                        className="w-1/4 bg-indigo-500 text-white py-2 text-lg rounded-xl hover:bg-indigo-600 transition"
                    >
                        Submit Details
                    </button>

                </div>

            </form>
        </div>
    );



};

export default RegistationForm
