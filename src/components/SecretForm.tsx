import {
  FaCopy,
  FaPlus,
  FaRegStar,
  FaSave,
  FaStar,
  FaTrash,
} from "react-icons/fa";
import { TSecret } from "../types";
import { MdBlock } from "react-icons/md";
import { IoDuplicate } from "react-icons/io5";
import { useEffect, useRef } from "react";

type SecretFormProps = {
  selectedSecretId?: string;
  secrets: TSecret[];
  selectedSecretIndex: number;
  newSecret: TSecret;
  setNewSecret: React.Dispatch<React.SetStateAction<TSecret | undefined>>;
  setSelectedSecretId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSecrets: React.Dispatch<React.SetStateAction<TSecret[] | undefined>>;
};

const SecretForm = ({
  selectedSecretId,
  secrets,
  selectedSecretIndex,
  newSecret,
  setNewSecret,
  setSelectedSecretId,
  setSecrets,
}: SecretFormProps) => {
  const descriptionContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!descriptionContainerRef.current) return;
    descriptionContainerRef.current.innerText = newSecret.description;
  }, [newSecret.description]);

  return (
    <div className="flex h-full w-full max-w-xl flex-col gap-8 text-white">
      <div className="flex justify-between">
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => {
              newSecret.description =
                descriptionContainerRef.current?.innerText || "";
              if (selectedSecretId !== undefined) {
                secrets[selectedSecretIndex] = newSecret;
                setSecrets([...secrets]);
              } else {
                setSecrets([...secrets, newSecret]);
              }
              setNewSecret(undefined);
              setSelectedSecretId(undefined);
            }}
            className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-800 bg-opacity-30 px-2 py-1 text-sm transition-all hover:bg-zinc-700 hover:bg-opacity-100"
          >
            <FaSave />
            <div>Save</div>
          </button>
          <button
            onClick={() => {
              setNewSecret(undefined);
              setSelectedSecretId(undefined);
            }}
            className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-800 bg-opacity-30 px-2 py-1 text-sm transition-all hover:bg-zinc-700 hover:bg-opacity-100"
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
                  ...secrets.slice(selectedSecretIndex + 1),
                ];
                setSecrets(newSecrets);
              }}
              className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-800 bg-opacity-30 px-2 py-1 text-sm transition-all hover:bg-zinc-700 hover:bg-opacity-100"
            >
              <FaTrash />
              <div>Delete</div>
            </button>
          </div>
        )}
      </div>
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="shrink-0">
            <div
              className="h-16 w-16 rounded-md"
              style={{
                background: newSecret.color,
              }}
              onClick={() => {
                (
                  document.querySelector("#colorSelector") as HTMLDivElement
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
          ref={descriptionContainerRef}
          contentEditable
          className="w-full border-b border-zinc-800 bg-transparent pb-2 text-sm outline-none"
        />
      </div>
      <div className="flex flex-col gap-2">
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
            className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-800 bg-opacity-30 px-2 py-1 transition-all hover:bg-zinc-700 hover:bg-opacity-100"
          >
            <FaPlus />
            <div className="text-sm">Add new field</div>
          </button>
        </div>
        <div className="flex h-full flex-col gap-2 overflow-auto">
          {newSecret.fields.map((field) => {
            const fieldIndex = newSecret.fields.findIndex(
              (f) => f.id === field.id,
            );
            return (
              <div key={`field-${field.id}`}>
                <div className="flex w-full flex-col items-center justify-between rounded-md border border-zinc-800 bg-zinc-800 bg-opacity-30">
                  <div className="flex w-full flex-col rounded-md p-2">
                    <input
                      value={field.name}
                      onChange={(e) => {
                        newSecret.fields[fieldIndex].name = e.target.value;
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
                        newSecret.fields[fieldIndex].value = e.target.value;
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
                          newSecret.fields[fieldIndex].type = e.target.value;
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
  );
};

export default SecretForm;
