import { ReactElement, useEffect, useState } from "react";
import { Settings } from "palette-types";
import {
  ChoiceDialog,
  Footer,
  Header,
  LoadingDots,
  PaletteActionButton,
} from "@components";
import { useFetch } from "@hooks";
import { useChoiceDialog } from "../../context/DialogContext.tsx";

export function SettingsMain(): ReactElement {
  const [settings, setSettings] = useState<Settings | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { fetchData: getSettings } = useFetch("/user/settings");
  const { fetchData: updateSettings } = useFetch("/user/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });

  const { openDialog, closeDialog } = useChoiceDialog();

  const TEXT_INPUT_STYLE =
    "w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2" +
    " focus:ring-blue-500";

  // Effect to fetch user settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        if (response.success) {
          setSettings(response.data as Settings);
        } else {
          setError("Failed to fetch settings.");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching settings.");
      } finally {
        setLoading(false);
      }
    };

    void fetchSettings();
  }, []);

  /**
   * Handles input change for settings fields.
   *
   * @param {string} field - The field name to update.
   * @param {unknown} value - The new value for the field.
   */
  const handleInputChange = (field: string, value: unknown) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  /**
   * Handles input change for preference fields.
   *
   * @param {string} field - The preference field name to update.
   * @param {unknown} value - The new value for the preference field.
   */
  const handlePreferenceChange = (field: string, value: unknown) => {
    if (settings) {
      setSettings({
        ...settings,
        preferences: { ...settings.preferences, [field]: value },
      });
    }
  };

  /**
   * Handles saving the updated settings.
   */
  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await updateSettings();
      if (response.success) {
        openDialog({
          title: "Success",
          message: "Settings updated successfully!",
          buttons: [
            { label: "Nice!", action: () => closeDialog(), autoFocus: true },
          ],
        });
      } else {
        openDialog({
          title: "Error",
          message: response.error || "Failed to save settings.",
          buttons: [
            {
              label: "Got It",
              action: () => closeDialog(),
              autoFocus: true,
              color: "RED",
            },
          ],
        });
      }
    } catch (error) {
      console.error(error);
      openDialog({
        title: "Error",
        message: "An error occurred while saving settings.",
        buttons: [
          {
            label: "Got It",
            action: () => closeDialog(),
            autoFocus: true,
            color: "RED",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renders the content of the settings page.
   *
   * @returns {ReactElement} The rendered content.
   */
  const renderContent = (): ReactElement => {
    if (loading) return <LoadingDots />;
    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (!settings) return <p className="text-center">No settings available</p>;

    return (
      <form
        className="h-full self-center grid p-10 w-full max-w-3xl my-6 gap-6 bg-gray-800 shadow-lg rounded-lg"
        onSubmit={(e) => e.preventDefault()}
      >
        <h1 className="font-extrabold text-5xl mb-2 text-center">
          User Settings
        </h1>
        {/* User Name */}
        <div>
          <label className="block font-bold text-gray-400 mb-2">
            User Name
          </label>
          <input
            type="text"
            className={TEXT_INPUT_STYLE}
            value={settings.userName}
            onChange={(e) => handleInputChange("userName", e.target.value)}
          />
          {/* Token */}
          <label className="block font-bold text-gray-400 mt-4 mb-2">
            Token Input
          </label>
          <input
            type="text"
            className={TEXT_INPUT_STYLE}
            value={settings.token}
            onChange={(e) => handleInputChange("token", e.target.value)}
          />
        </div>
        {/* Preferences */}
        <div className={"grid gap-2"}>
          <label className="block font-bold text-gray-400">Preferences</label>
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.preferences.darkMode}
                onChange={(e) =>
                  handlePreferenceChange("darkMode", e.target.checked)
                }
              />
              <span className="text-white">Dark Mode</span>
            </label>
          </div>
          <div>
            <input
              type="text"
              name="max-points"
              id="rating-max-points"
              className={
                "w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              }
            />
          </div>
        </div>

        <PaletteActionButton
          title={"Update Settings"}
          onClick={() => void handleSave()}
          color={"BLUE"}
        />
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 text-white flex flex-col">
      <Header />
      <main className="flex-1 flex justify-center items-center p-6">
        {renderContent()}
      </main>
      <Footer />
      <ChoiceDialog />
    </div>
  );
}
