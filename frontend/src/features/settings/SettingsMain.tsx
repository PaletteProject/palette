import { ReactElement, useState } from "react";
import {
  ChoiceDialog,
  Footer,
  Header,
  LoadingDots,
  PaletteActionButton,
} from "@components";
import { useFetch } from "@hooks";
import { useChoiceDialog } from "../../context/DialogContext.tsx";
import { useSettings } from "../../context/SettingsContext.tsx";

export function SettingsMain(): ReactElement {
  const { settings, setSettings, error } = useSettings();
  const [loading, setLoading] = useState(false);

  const { fetchData: updateSettings } = useFetch("/user/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });

  const { openDialog, closeDialog } = useChoiceDialog();

  const TEXT_INPUT_STYLE =
    "w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2" +
    " focus:ring-blue-500";

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
            type="password"
            className={TEXT_INPUT_STYLE}
            value={settings.token}
            onChange={(e) => handleInputChange("token", e.target.value)}
          />
        </div>
        {/* Preferences */}
        <div className={"grid gap-2"}>
          <h2 className="block font-bold text-gray-400">Preferences</h2>
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
          {/* Default Ratings */}
          <div>
            <h2 className="block font-bold text-gray-400">Default Ratings</h2>

            <div className={"grid gap-1 "}>
              <div className={"grid items-center gap-2"}>
                <div className={"flex items-center gap-2 mt-2"}>
                  <label className={""}> Max Points</label>
                  <input
                    type="number"
                    className={`${TEXT_INPUT_STYLE} w-min`}
                    min={1} // ensure max is always greater than 0
                    max={99}
                    value={settings.preferences.defaultRatings.maxDefaultPoints}
                    placeholder={""}
                    onChange={(event) => {
                      setSettings((prevState) => {
                        const newValue = Number(event.target.value);
                        return {
                          ...prevState,
                          preferences: {
                            ...prevState.preferences,
                            defaultRatings: {
                              ...prevState.preferences.defaultRatings,
                              maxDefaultPoints: isNaN(newValue) ? 0 : newValue,
                            },
                          },
                        };
                      });
                    }}
                  />
                </div>

                <label className={"row-start-2 text-nowrap"}>
                  {" "}
                  Max Rating Description
                </label>
                <textarea
                  className={`${TEXT_INPUT_STYLE} row-start-3 col-span-4`}
                  value={
                    settings.preferences.defaultRatings.maxDefaultDescription
                  }
                  onChange={(event) => {
                    setSettings((prevState) => {
                      return {
                        ...prevState,
                        preferences: {
                          ...prevState.preferences,
                          defaultRatings: {
                            ...prevState.preferences.defaultRatings,
                            maxDefaultDescription: event.target.value,
                          },
                        },
                      };
                    });
                  }}
                />
              </div>
              <div className={"grid items-center gap-2"}>
                <div className={"flex items-center gap-2 mt-2"}>
                  <label className={""}> Min Points</label>
                  <input
                    type="number"
                    className={`${TEXT_INPUT_STYLE} w-min`}
                    min={0}
                    max={
                      settings.preferences.defaultRatings.maxDefaultPoints - 1
                    } // ensure min is less than or equal to the max
                    value={settings.preferences.defaultRatings.minDefaultPoints}
                    placeholder={""}
                    onChange={(event) => {
                      setSettings((prevState) => {
                        const newValue = Number(event.target.value);
                        return {
                          ...prevState,
                          preferences: {
                            ...prevState.preferences,
                            defaultRatings: {
                              ...prevState.preferences.defaultRatings,
                              minDefaultPoints: isNaN(newValue) ? 0 : newValue,
                            },
                          },
                        };
                      });
                    }}
                  />
                </div>

                <label className={"row-start-2 text-nowrap"}>
                  {" "}
                  Min Rating Description
                </label>
                <textarea
                  className={`${TEXT_INPUT_STYLE} row-start-3 col-span-4`}
                  value={
                    settings.preferences.defaultRatings.minDefaultDescription
                  }
                  onChange={(event) => {
                    setSettings((prevState) => {
                      return {
                        ...prevState,
                        preferences: {
                          ...prevState.preferences,
                          defaultRatings: {
                            ...prevState.preferences.defaultRatings,
                            minDefaultDescription: event.target.value,
                          },
                        },
                      };
                    });
                  }}
                />
              </div>
            </div>
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
