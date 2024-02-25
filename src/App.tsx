import { IoIosSearch } from "react-icons/io";
import { FaEye, FaEyeSlash, FaPlus } from "react-icons/fa";
import { useAtom } from "jotai";
import { secretsAtom } from "./atoms";
import { useEffect, useMemo, useState } from "react";
import { TSecret } from "./types";
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { zlibSync, unzlibSync, strToU8, strFromU8 } from "fflate";
import { fromUint8Array, toUint8Array } from "js-base64";
import { IoMenu } from "react-icons/io5";
import { decrypt, encrypt } from "./utils";
import SecretForm from "./components/SecretForm";
import { FaLock } from "react-icons/fa";
import { FaShare } from "react-icons/fa";

// TODO: Add encryption and decryption, it should be reversable
// TODO: Add a way to manage secret urls, make it more manageble
// TODO: Make this a PWA, update manifest.json

const App = () => {
  const [secrets, setSecrets] = useAtom(secretsAtom);
  const [newSecret, setNewSecret] = useState<TSecret>();
  const [selectedSecretId, setSelectedSecretId] = useState<string>();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNavBar, setShowNavBar] = useState(true);
  const [showPasswordValue, setShowPasswordValue] = useState(false);
  const selectedSecretIndex = useMemo(() => {
    return (secrets || []).findIndex((s) => s.id === selectedSecretId);
  }, [secrets, selectedSecretId]);
  const useLinkSource = useMemo(() => {
    return !!window.location.hash;
  }, []);
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    (async () => {
      if (secrets || showPasswordModal) return;
      const data = useLinkSource
        ? window.location.hash
        : localStorage.getItem("data") || "";
      const useCustomPassword = data.includes("/safe@secret-custom/");
      if (useCustomPassword && !password) return setShowPasswordModal(true);

      try {
        const [encrypted, iv] = data
          .substring(1)
          .split(useCustomPassword ? "/safe@secret-custom/" : "/safe@secret/");

        const secrestsCompressedBase64 =
          encrypted && iv
            ? await decrypt(
                toUint8Array(encrypted),
                toUint8Array(iv),
                password || import.meta.env.VITE_APP_DEFAULT_APP_PASSWORD,
              )
            : "";

        if (!secrestsCompressedBase64) {
          setSecrets([]);
          return;
        }
        const secrestsCompressedUint8Arr = toUint8Array(
          secrestsCompressedBase64,
        );
        const secretsDecoded = strFromU8(
          unzlibSync(secrestsCompressedUint8Arr),
        );
        setSecrets(JSON.parse(secretsDecoded));
      } catch (error) {
        setShowPasswordModal(true);
      }
    })();
  }, [password, secrets, setSecrets, showPasswordModal, useLinkSource]);

  useEffect(() => {
    (async () => {
      if (!secrets) return;
      const secrestsCompressedUint8Arr = zlibSync(
        strToU8(JSON.stringify(secrets)),
        { level: 9 },
      );

      const secrestsCompressedBase64 = fromUint8Array(
        secrestsCompressedUint8Arr,
      );
      const { ciphertext, iv } = await encrypt(
        secrestsCompressedBase64,
        password || import.meta.env.VITE_APP_DEFAULT_APP_PASSWORD,
      );

      const hashedSecret = `#${fromUint8Array(new Uint8Array(ciphertext))}${password ? "/safe@secret-custom/" : "/safe@secret/"}${fromUint8Array(iv)}`;

      if (useLinkSource) {
        window.location.hash = hashedSecret;
      } else {
        localStorage.setItem("data", hashedSecret);
      }
    })();
  }, [password, secrets, useLinkSource]);

  return (
    <>
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 z-40 rounded bg-white bg-opacity-10 backdrop-blur-md"></div>
          <div className="z-50 flex w-full max-w-xs flex-col gap-2 rounded-md bg-zinc-900 p-4">
            <div className="relative w-full overflow-hidden rounded-md text-sm text-white">
              <input
                type={showPasswordValue ? "text" : "password"}
                className="w-full bg-zinc-700 px-8 py-2 outline-none"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="pointer-events-none absolute inset-0 left-2 flex items-center justify-start">
                <FaLock />
              </div>
              <div className="pointer-events-none absolute inset-0 right-0 flex items-center justify-end">
                <button
                  className="pointer-events-auto flex aspect-square h-full items-center justify-center"
                  onClick={() => {
                    setShowPasswordValue((state) => !state);
                  }}
                >
                  {showPasswordValue ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="flex text-white">
              <button
                onClick={() => {
                  if (!password) return;
                  setShowPasswordModal(false);
                }}
                className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-800 bg-opacity-30 px-2 py-1 text-sm transition-all hover:bg-zinc-700 hover:bg-opacity-100"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="fixed inset-0 flex flex-col-reverse gap-1 overflow-hidden bg-zinc-950">
        <button
          onClick={() => {
            setShowNavBar((state) => !state);
          }}
          className="flex items-center border-t-2 border-t-zinc-700 bg-zinc-800 p-4 text-xl text-white lg:hidden"
        >
          <IoMenu />
        </button>
        <div className="relative flex h-full gap-1 overflow-hidden border-b-2 border-b-zinc-700 lg:border-b-0">
          <div
            className={`absolute inset-0 bg-black bg-opacity-30 backdrop-blur-md transition-all lg:pointer-events-none lg:opacity-0 ${!showNavBar ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"}`}
            onClick={() => setShowNavBar(false)}
          ></div>
          <div
            className={`absolute inset-0 z-50 flex h-full w-full flex-col overflow-hidden border-r-0 border-r-zinc-700 bg-zinc-800 bg-opacity-80 transition-all sm:max-w-xs lg:static lg:border-r-2 lg:bg-opacity-100 ${!showNavBar && "-translate-x-full lg:translate-x-0"}`}
          >
            <div className="flex shrink-0 gap-2 p-4">
              <div className="relative w-full overflow-hidden rounded-md text-sm text-white">
                <input
                  type="text"
                  className="w-full bg-zinc-700 p-2 pl-8 outline-none"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="pointer-events-none absolute inset-0 left-2 flex items-center">
                  <IoIosSearch />
                </div>
              </div>
            </div>
            <div className="my-4 flex h-full w-full overflow-hidden">
              <div className="flex w-full flex-col gap-2 overflow-auto px-4 text-white">
                {secrets
                  ?.filter(
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
            <div className="flex shrink-0 border-t border-t-zinc-700 text-white">
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
                className="bg-blue-500 bg-opacity-70 p-4 hover:bg-opacity-100"
              >
                <FaPlus />
              </button>
              <button
                className="bg-zinc-700 bg-opacity-40 p-4 hover:bg-opacity-70"
                onClick={() => {
                  setShowPasswordModal(true);
                }}
              >
                <FaLock />
              </button>
              <button
                className="bg-zinc-700 bg-opacity-20 p-4 hover:bg-opacity-70"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.href}${
                      window.location.hash || localStorage.getItem("data")
                    }`,
                  );
                }}
              >
                <FaShare />
              </button>
            </div>
          </div>
          <div className="flex w-full items-center justify-center overflow-hidden border-l-0 bg-zinc-900 py-4 lg:border-l-2 lg:border-l-zinc-700">
            <div className="flex h-full w-full justify-center overflow-auto px-4">
              {newSecret ? (
                <SecretForm
                  selectedSecretId={selectedSecretId}
                  secrets={secrets || []}
                  selectedSecretIndex={selectedSecretIndex}
                  newSecret={newSecret}
                  setNewSecret={setNewSecret}
                  setSelectedSecretId={setSelectedSecretId}
                  setSecrets={setSecrets}
                />
              ) : (
                <div className="flex h-full max-w-xs items-center justify-center text-center text-lg text-white">
                  Select a secret or let's start by creating a new one...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
