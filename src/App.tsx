import { IoIosSearch } from "react-icons/io";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useAtom } from "jotai";
import { secretsAtom } from "./atoms";
import { useEffect, useMemo, useState } from "react";
import { TSecret } from "./types";
import { FaRegStar } from "react-icons/fa";
import { FaCopy } from "react-icons/fa";
import { IoDuplicate } from "react-icons/io5";
import { FaStar } from "react-icons/fa";
import { FaSave } from "react-icons/fa";
import { MdBlock } from "react-icons/md";
import { zlibSync, unzlibSync, strToU8, strFromU8 } from "fflate";
import { fromUint8Array, toUint8Array } from "js-base64";
import { IoMenu } from "react-icons/io5";

// TODO: Add encryption and decryption, it should be reversable
// TODO: Add a way to manage secret urls, make it more manageble
// TODO: Make this a PWA, update manifest.json

const App = () => {
  const [secrets, setSecrets] = useAtom(secretsAtom);
  const [newSecret, setNewSecret] = useState<TSecret>();
  const [selectedSecretId, setSelectedSecretId] = useState<string>();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNavBar, setShowNavBar] = useState(true);
  const selectedSecretIndex = useMemo(() => {
    return (secrets || []).findIndex((s) => s.id === selectedSecretId);
  }, [secrets, selectedSecretId]);

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
      { level: 9 },
    );

    const secrestsCompressedBase64 = fromUint8Array(secrestsCompressedUint8Arr);
    window.location.hash = secrestsCompressedBase64;
  }, [secrets]);

  if (!secrets) return <></>;

  return (
    <div className="fixed inset-0 flex flex-col gap-1 bg-zinc-950">
      <button
        onClick={() => {
          setShowNavBar((state) => !state);
        }}
        className="flex items-center border-b-2 border-b-zinc-700 bg-zinc-800 px-4 py-2 text-xl text-white lg:hidden"
      >
        <IoMenu />
      </button>
      <div
        className={`relative flex h-full gap-2 border-t-2 border-t-zinc-700 lg:border-none`}
      >
        <div
          className={`absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-all lg:pointer-events-none lg:opacity-0 ${!showNavBar ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"}`}
          onClick={() => setShowNavBar(false)}
        ></div>
        <div
          className={`absolute inset-0 z-50 flex h-full w-full flex-col border-r-0 border-r-zinc-700 bg-zinc-800 transition-all sm:max-w-xs lg:static lg:border-r-2 ${!showNavBar && "-translate-x-full lg:translate-x-0"}`}
        >
          <div className="flex gap-2 p-4">
            <div className="relative w-full overflow-hidden rounded-md text-sm text-white">
              <input
                type="text"
                className="h-8 w-full bg-zinc-700 p-2 pl-8 outline-none"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="pointer-events-none absolute inset-0 left-2 flex items-center">
                <IoIosSearch />
              </div>
            </div>
            <button
              onClick={() => {
                setNewSecret({
                  id: crypto.randomUUID(),
                  app: "",
                  name: "",
                  color: "#ffffff",
                  starred: false,
                  description: "",
                  group: "general",
                  fields: [
                    {
                      id: crypto.randomUUID(),
                      name: "username",
                      type: "text",
                      value: "",
                    },
                    {
                      id: crypto.randomUUID(),
                      name: "password",
                      type: "password",
                      value: "",
                    },
                  ],
                });
                setShowNavBar(false);
                setSelectedSecretId(undefined);
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-500 text-white transition-all hover:bg-blue-400"
            >
              <FaPlus />
            </button>
          </div>
          <div className="my-4 flex w-full overflow-hidden">
            <div className="flex w-full flex-col gap-2 overflow-auto px-4 text-white">
              {secrets
                .filter(
                  (s) =>
                    !searchTerm ||
                    `${s.app}${s.name}`
                      .toLowerCase()
                      .trim()
                      .replace(/ /g, "")
                      .includes(
                        searchTerm.toLowerCase().trim().replace(/ /g, ""),
                      ),
                )
                .sort((s1, s2) => (s2.starred ? 1 : 0) - (s1.starred ? 1 : 0))
                .map((secret) => (
                  <div
                    key={`secret-${secret.id}`}
                    onClick={() => {
                      setNewSecret(structuredClone(secret));
                      setSelectedSecretId(secret.id);
                      setShowNavBar(false);
                    }}
                    className={`flex w-full cursor-pointer justify-between gap-2 rounded-md p-2 ${
                      selectedSecretId === secret.id
                        ? "bg-zinc-600 bg-opacity-30"
                        : "bg-transparent transition-all hover:bg-zinc-600 hover:bg-opacity-30"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div
                        className="h-10 w-10 rounded-md"
                        style={{ background: secret.color }}
                      ></div>
                      <div className="flex flex-col overflow-hidden">
                        <div className="truncate font-bold">{secret.app}</div>
                        <div className="truncate text-xs text-zinc-400">
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
        </div>
        <div className="flex w-full items-center justify-center overflow-hidden border-l-0 bg-zinc-900 p-4 lg:border-l-2 lg:border-l-zinc-700">
          {newSecret ? (
            <div className="flex h-full w-full max-w-xl flex-col gap-8 text-white">
              <div className="flex justify-between">
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={() => {
                      if (selectedSecretId !== undefined) {
                        secrets[selectedSecretIndex] = newSecret;
                        setSecrets([...secrets]);
                      } else {
                        setSecrets([...secrets, newSecret]);
                      }
                      setNewSecret(undefined);
                      setSelectedSecretId(undefined);
                    }}
                    className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-800 bg-opacity-30 px-2 py-1 text-xs transition-all hover:bg-zinc-700 hover:bg-opacity-100"
                  >
                    <FaSave />
                    <div>Save</div>
                  </button>
                  <button
                    onClick={() => {
                      setNewSecret(undefined);
                      setSelectedSecretId(undefined);
                    }}
                    className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-800 bg-opacity-30 px-2 py-1 text-xs transition-all hover:bg-zinc-700 hover:bg-opacity-100"
                  >
                    <MdBlock />
                    <div>Cancel</div>
                  </button>
                </div>
                {selectedSecretId !== undefined && (
                  <div>
                    <button
                      onClick={() => {
                        setNewSecret(undefined);
                        setSelectedSecretId(undefined);
                        const newSecrets = [
                          ...secrets.slice(0, selectedSecretIndex),
                          ...secrets.slice(selectedSecretIndex),
                        ];
                        setSecrets(newSecrets);
                      }}
                      className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-800 bg-opacity-30 px-2 py-1 text-xs"
                    >
                      <FaTrash />
                      <div>Delete</div>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="relative shrink-0">
                    <div
                      className="h-16 w-16 rounded-md"
                      style={{
                        background: newSecret.color,
                      }}
                      onClick={() => {
                        (
                          document.querySelector(
                            "#colorSelector",
                          ) as HTMLDivElement
                        ).click();
                      }}
                    ></div>
                    <input
                      id="colorSelector"
                      type="color"
                      className="pointer-events-none absolute h-0 w-0 opacity-0"
                      tabIndex={-1}
                      onChange={(e) => {
                        newSecret.color = e.target.value;
                        setNewSecret({ ...newSecret });
                      }}
                    />
                  </div>
                  <div className="flex w-[calc(100%_-_100px)] flex-col">
                    <input
                      value={newSecret.app}
                      onChange={(e) => {
                        setNewSecret({ ...newSecret, app: e.target.value });
                      }}
                      className="bg-transparent text-4xl font-bold text-white outline-none"
                      placeholder="Aplication..."
                    />
                    <input
                      value={newSecret.name}
                      onChange={(e) => {
                        setNewSecret({ ...newSecret, name: e.target.value });
                      }}
                      type="text"
                      className="bg-transparent text-sm font-medium text-zinc-400 outline-none"
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
                  className="w-full border-b border-zinc-800 bg-transparent pb-2 text-sm outline-none"
                />
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto">
                <div className="">
                  <button
                    onClick={() => {
                      newSecret.fields.push({
                        id: crypto.randomUUID(),
                        name: "",
                        type: "",
                        value: "",
                      });
                      setNewSecret({
                        ...newSecret,
                      });
                    }}
                    className="flex gap-2 rounded-md border border-zinc-800 bg-zinc-800 bg-opacity-30 p-2 transition-all hover:bg-zinc-700 hover:bg-opacity-100"
                  >
                    <FaPlus />
                    <div className="text-xs">Add new field</div>
                  </button>
                </div>
                <div className="flex h-full flex-col gap-2 overflow-auto">
                  {newSecret.fields.map((field) => {
                    const fieldIndex = newSecret.fields.findIndex(
                      (f) => f.id === field.id,
                    );
                    return (
                      <div key={`field-${field.id}`}>
                        <div className="flex w-full flex-col items-center justify-between overflow-hidden rounded-md border border-zinc-800 bg-zinc-800 bg-opacity-30">
                          <div className="flex w-full flex-col rounded-md p-2">
                            <input
                              value={field.name}
                              onChange={(e) => {
                                newSecret.fields[fieldIndex].name =
                                  e.target.value;
                                setNewSecret({
                                  ...newSecret,
                                });
                              }}
                              type="text"
                              className="bg-transparent text-xs font-medium text-slate-200 outline-none"
                              placeholder={"field name..."}
                            />
                            <input
                              value={field.value}
                              onChange={(e) => {
                                newSecret.fields[fieldIndex].value =
                                  e.target.value;
                                setNewSecret({
                                  ...newSecret,
                                });
                              }}
                              type={field.type}
                              className="bg-transparent text-base font-medium text-slate-200 outline-none"
                              placeholder={`${field.name || "field value"}...`}
                            />
                          </div>
                          <div className="flex w-full items-center justify-between gap-2 bg-zinc-800 p-2 text-xs">
                            <div className="flex items-center gap-2">
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
                                  newSecret.fields = [
                                    ...newSecret.fields,
                                    field,
                                  ];
                                  setNewSecret({ ...newSecret });
                                }}
                              >
                                <IoDuplicate />
                              </button>
                              <button
                                title="Delete"
                                onClick={() => {
                                  newSecret.fields = [
                                    ...newSecret.fields.slice(0, fieldIndex),
                                    ...newSecret.fields.slice(fieldIndex + 1),
                                  ];
                                  setNewSecret({
                                    ...newSecret,
                                  });
                                }}
                              >
                                <FaTrash />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                title="Type"
                                value={newSecret.fields[fieldIndex].type}
                                className="bg-transparent"
                                onChange={(e) => {
                                  newSecret.fields[fieldIndex].type =
                                    e.target.value;
                                  setNewSecret({ ...newSecret });
                                }}
                              >
                                <option
                                  value="text"
                                  className="text bg-zinc-800 text-white"
                                >
                                  Text
                                </option>
                                <option
                                  value="password"
                                  className="text bg-zinc-800 text-white"
                                >
                                  Password
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-xs text-center text-lg text-white">
              Select a secret or let's start by creating a new one...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
