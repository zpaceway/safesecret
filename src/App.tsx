import { IoIosSearch } from "react-icons/io";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useAtom } from "jotai";
import { secretsAtom } from "./atoms";
import { useEffect, useState } from "react";
import { TSecret } from "./types";
import { FaRegStar } from "react-icons/fa";
import { FaCopy } from "react-icons/fa";
import { IoDuplicate } from "react-icons/io5";
import { FaStar } from "react-icons/fa";
import { FaSave } from "react-icons/fa";
import { MdBlock } from "react-icons/md";
import { zlibSync, unzlibSync, strToU8, strFromU8 } from "fflate";
import { fromUint8Array, toUint8Array } from "js-base64";

// TODO: Add encryption and decryption, it should be reversable
// TODO: Add a way to manage secret urls, make it more manageble
// TODO: Make this a PWA, update manifest.json

const App = () => {
  const [secrets, setSecrets] = useAtom(secretsAtom);

  const [newSecret, setNewSecret] = useState<TSecret>();
  const [selectedSecretIndex, setSelectedSecretIndex] = useState<number>();

  useEffect(() => {
    const secrestsCompressedBase64 = window.location.hash.substring(1);
    if (!secrestsCompressedBase64) {
      setSecrets([]);
      return;
    }
    const secrestsCompressedUint8Arr = toUint8Array(secrestsCompressedBase64);
    const secretsDecoded = strFromU8(unzlibSync(secrestsCompressedUint8Arr));
    setSecrets(JSON.parse(secretsDecoded));
  }, [setSecrets]);

  useEffect(() => {
    if (!secrets) return;
    const secrestsCompressedUint8Arr = zlibSync(
      strToU8(JSON.stringify(secrets)),
      { level: 9 }
    );

    const secrestsCompressedBase64 = fromUint8Array(secrestsCompressedUint8Arr);
    window.location.hash = secrestsCompressedBase64;
  }, [secrets]);

  if (!secrets) return <></>;

  return (
    <div className="fixed inset-0 bg-zinc-950 flex gap-1">
      <div className="flex flex-col gap-8 max-w-xs h-full w-full bg-zinc-800 p-4 border-r-zinc-700 border-r-2">
        <div className="flex gap-2 h-8">
          <div className="overflow-hidden w-full relative text-sm text-white rounded-md">
            <input
              type="text"
              className="bg-zinc-700 h-8 pl-8 p-2 w-full outline-none"
              placeholder="Search"
            />
            <div className="absolute pointer-events-none flex items-center left-2 inset-0">
              <IoIosSearch />
            </div>
          </div>
          <button
            onClick={() => {
              setNewSecret({
                app: "",
                name: "",
                color: "#ffffff",
                starred: false,
                description: "",
                group: "general",
                fields: [
                  { name: "username", type: "text", value: "" },
                  { name: "password", type: "password", value: "" },
                ],
              });
              setSelectedSecretIndex(undefined);
            }}
            className="h-8 w-8 shrink-0 rounded-md justify-center items-center flex text-white bg-blue-500"
          >
            <FaPlus />
          </button>
        </div>
        <div className="flex flex-col gap-2 text-white">
          {secrets
            .sort((s1, s2) => (s2.starred ? 1 : 0) - (s1.starred ? 1 : 0))
            .map((secret, index) => (
              <div
                key={`secret-${index}`}
                onClick={() => {
                  setNewSecret(structuredClone(secret));
                  setSelectedSecretIndex(index);
                }}
                className={`w-full rounded-md justify-between cursor-pointer flex gap-2 p-2 ${
                  selectedSecretIndex === index
                    ? "bg-blue-500 bg-opacity-10"
                    : "bg-transparent"
                }`}
              >
                <div className="flex gap-2 overflow-hidden">
                  <div
                    className="w-10 h-10 rounded-md"
                    style={{ background: secret.color }}
                  ></div>
                  <div className="flex flex-col overflow-hidden">
                    <div className="font-bold truncate">{secret.app}</div>
                    <div className="text-xs text-zinc-400 truncate">
                      {secret.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {secret.starred ? (
                    <FaStar className="text-yellow-400" />
                  ) : (
                    <FaRegStar />
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="p-4 overflow-hidden flex w-full justify-center items-center bg-zinc-900 border-l-zinc-700 border-l-2">
        {newSecret && (
          <div className="w-full flex flex-col gap-8 max-w-xl h-full text-white">
            <div className="flex justify-between">
              <div className="flex text-sm gap-2">
                <button
                  onClick={() => {
                    if (selectedSecretIndex !== undefined) {
                      secrets[selectedSecretIndex] = newSecret;
                      setSecrets([...secrets]);
                    } else {
                      setSecrets([...secrets, newSecret]);
                    }
                    setNewSecret(undefined);
                    setSelectedSecretIndex(undefined);
                  }}
                  className="flex gap-1 items-center border border-zinc-800 text-xs bg-zinc-800 bg-opacity-30 rounded-md px-2 py-1"
                >
                  <FaSave />
                  <div>Save</div>
                </button>
                <button
                  onClick={() => {
                    setNewSecret(undefined);
                    setSelectedSecretIndex(undefined);
                  }}
                  className="flex gap-1 items-center border border-zinc-800 text-xs bg-zinc-800 bg-opacity-30 rounded-md px-2 py-1"
                >
                  <MdBlock />
                  <div>Cancel</div>
                </button>
              </div>
              {selectedSecretIndex !== undefined && (
                <div>
                  <button
                    onClick={() => {
                      setNewSecret(undefined);
                      setSelectedSecretIndex(undefined);
                      const newSecrets = [
                        ...secrets.slice(0, selectedSecretIndex),
                        ...secrets.slice(selectedSecretIndex + 1),
                      ];
                      setSecrets(newSecrets);
                    }}
                    className="flex gap-1 items-center border border-zinc-800 text-xs bg-zinc-800 bg-opacity-30 rounded-md px-2 py-1"
                  >
                    <FaTrash />
                    <div>Delete</div>
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-between gap-4 items-center w-full overflow-hidden">
              <div className="flex gap-2 overflow-hidden">
                <div className="relative shrink-0">
                  <div
                    className="w-16 h-16 rounded-md"
                    style={{
                      background: newSecret.color,
                    }}
                    onClick={() => {
                      (
                        document.querySelector(
                          "#colorSelector"
                        ) as HTMLDivElement
                      ).click();
                    }}
                  ></div>
                  <input
                    id="colorSelector"
                    type="color"
                    className="w-0 h-0 absolute opacity-0 pointer-events-none"
                    onChange={(e) => {
                      newSecret.color = e.target.value;
                      setNewSecret({ ...newSecret });
                    }}
                  />
                </div>
                <div className="flex flex-col w-[calc(100%_-_100px)]">
                  <input
                    value={newSecret.app}
                    onChange={(e) => {
                      setNewSecret({ ...newSecret, app: e.target.value });
                    }}
                    className="text-white bg-transparent font-bold text-4xl outline-none"
                    placeholder="Aplication..."
                  />
                  <input
                    value={newSecret.name}
                    onChange={(e) => {
                      setNewSecret({ ...newSecret, name: e.target.value });
                    }}
                    type="text"
                    className="text-zinc-400 bg-transparent font-medium text-sm outline-none"
                    placeholder="Name.."
                  />
                </div>
              </div>
              <button
                className="text-4xl"
                onClick={() => {
                  newSecret.starred = !newSecret.starred;
                  setNewSecret({ ...newSecret });
                }}
              >
                {newSecret.starred ? (
                  <FaStar className="text-yellow-400" />
                ) : (
                  <FaRegStar />
                )}
              </button>
            </div>
            <div className="">
              <div
                contentEditable
                className="bg-transparent outline-none w-full border-b pb-2 text-sm border-zinc-800"
              />
            </div>
            <div className="overflow-hidden flex flex-col gap-2">
              <div className="">
                <button
                  onClick={() => {
                    newSecret.fields.push({
                      name: "",
                      type: "",
                      value: "",
                    });
                    setNewSecret({
                      ...newSecret,
                    });
                  }}
                  className="flex gap-2 bg-zinc-800 bg-opacity-30 border border-zinc-800 p-2 rounded-md"
                >
                  <FaPlus />
                  <div className="text-xs">Add new field</div>
                </button>
              </div>
              <div className="flex h-full flex-col gap-2 overflow-auto">
                {newSecret.fields.map((field, index) => (
                  <div key={`field-${index}`}>
                    <div className="rounded-md overflow-hidden flex border border-zinc-800 flex-col w-full bg-zinc-800 bg-opacity-30 items-center justify-between">
                      <div className="flex p-2 flex-col rounded-md w-full">
                        <input
                          value={field.name}
                          onChange={(e) => {
                            newSecret.fields[index].name = e.target.value;
                            setNewSecret({
                              ...newSecret,
                            });
                          }}
                          type="text"
                          className="text-slate-200 text-xs bg-transparent font-medium outline-none"
                          placeholder={"field name..."}
                        />
                        <input
                          value={field.value}
                          onChange={(e) => {
                            newSecret.fields[index].value = e.target.value;
                            setNewSecret({
                              ...newSecret,
                            });
                          }}
                          type={field.type}
                          className="text-slate-200 bg-transparent font-medium text-base outline-none"
                          placeholder={`${field.name || "field value"}...`}
                        />
                      </div>
                      <div className="w-full gap-2 flex text-xs items-center justify-between p-2 bg-zinc-800">
                        <div className="flex gap-2 items-center">
                          <button
                            title="Copy"
                            onClick={() => {
                              navigator.clipboard.writeText(field.value);
                            }}
                          >
                            <FaCopy />
                          </button>
                          <button
                            title="Duplicate"
                            onClick={() => {
                              newSecret.fields = [...newSecret.fields, field];
                              setNewSecret({ ...newSecret });
                            }}
                          >
                            <IoDuplicate />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => {
                              newSecret.fields = [
                                ...newSecret.fields.slice(0, index),
                                ...newSecret.fields.slice(index + 1),
                              ];
                              setNewSecret({
                                ...newSecret,
                              });
                            }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                        <div className="flex gap-2 items-center">
                          <select
                            title="Type"
                            value={newSecret.fields[index].type}
                            className="outline-none bg-transparent"
                            onChange={(e) => {
                              newSecret.fields[index].type = e.target.value;
                              setNewSecret({ ...newSecret });
                            }}
                          >
                            <option
                              value="text"
                              className="text text-white bg-zinc-800"
                            >
                              Text
                            </option>
                            <option
                              value="password"
                              className="text text-white bg-zinc-800"
                            >
                              Password
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
