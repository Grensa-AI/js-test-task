import { useState, useEffect } from "react";
import styled from "styled-components";
import { CustomDropdown } from "../Components/Dropdown/Dropdown";
import i18n from "i18next";
import { useTranslation } from "react-i18next";

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  color: #111827;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
`;



const SmallButton = styled.button`
  padding: 6px 10px;
  font-size: 12px;
  background: #e5e7eb;
  color: #111827;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #d1d5db;
  }
`;

const StatusMessage = styled.span`
  font-size: 12px;
  color: green;
`;

const Skeleton = styled.div`
  background: #e5e7eb;
  border-radius: 6px;
  width: 100%;
  height: 36px;
  animation: pulse 1.5s infinite ease-in-out;

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const SkeletonSmall = styled(Skeleton)`
  width: 80px;
  height: 28px;
`;
function maskApiKey(key) {
  if (!key) return "";
  const visible = key.slice(0, 8);
  const hidden = "*".repeat(Math.max(key.length - 8, 0));
  return `${visible}${hidden}`;
}

export const SettingsPage = () => {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState("");
  const [language, setLanguage] = useState("en");
  const [status, setStatus] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(["openai_api_key", "app_language"], (result) => {
      if (result.openai_api_key) {
        setApiKey(result.openai_api_key);
        setIsEditing(false);
      }
      if (result.app_language) {
        setLanguage(result.app_language);
      }
      setLoading(false);
    });
  }, []);

  const handleSaveApiKey = () => {
    chrome.storage.local.set({ openai_api_key: apiKey }, () => {
      setStatus(t("api_key_saved"));
      setIsEditing(false);
      setTimeout(() => setStatus(""), 2000);
    });
  };


  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };

  return (
    <SettingsContainer>
      <div>
        <Label htmlFor="api-key">{t("openai_api_key")}</Label>
        <InputWrapper>
          {loading ? (
            <>
              <Skeleton />
              <SkeletonSmall />
            </>
          ) : isEditing ? (
            <>
              <Input
                id="api-key"
                type="text"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder={t("enter_api_key")}
              />
              <SmallButton onClick={handleSaveApiKey}>{t("save")}</SmallButton>
            </>
          ) : (
            <>
              <Input id="api-key" type="text" disabled={true} value={maskApiKey(apiKey)} />
              <SmallButton onClick={handleEditClick}>{t("edit")}</SmallButton>
            </>
          )}
        </InputWrapper>
        {!loading && status && <StatusMessage>{status}</StatusMessage>}
      </div>

      <div>
        <Label htmlFor="language">{t("language")}:</Label>
        {loading ? (
          <Skeleton />
        ) : (
          <CustomDropdown
            value={language}
            onChange={(val) => {
              setLanguage(val);
              i18n.changeLanguage(val);
              chrome.storage.sync.set({ app_language: val });
            }}
            options={[
              { label: t("english"), value: "en" },
              { label: t("russian"), value: "ru" },
            ]}
          />
        )}
      </div>
    </SettingsContainer>
  );
};
