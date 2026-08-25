export const CHOICE_LETTERS = ["A", "B", "C"] as const;

export type ChoiceLetter = (typeof CHOICE_LETTERS)[number];

export interface EncounterFlavor {
  title: string;
  description: string;
  principle: string;
}

export const ENCOUNTER_FLAVOR: readonly EncounterFlavor[] = [
  {
    title: "Locked employee laptop",
    description:
      "A helpdesk ticket says two laptops will not open shared files, and the file names look scrambled.",
    principle:
      "Isolate first. Changing a possibly infected device can destroy evidence and help the attack spread.",
  },
  {
    title: "Infected workstation cluster",
    description:
      "The same encryption pattern is appearing on a file share. You still do not know how far it has gone.",
    principle:
      "Contain what you can see without switching off every system the business still needs.",
  },
  {
    title: "Privileged account warning",
    description:
      "Identity logs show unusual sign-ins for an administrator account used by the outsourced IT provider.",
    principle:
      "Compromised admin access is more dangerous than a single locked laptop. Reset and revoke, then recover safely.",
  },
  {
    title: "Disconnected warehouse scanners",
    description:
      "Trucks are waiting on the yard. The logistics platform is unstable and Monday deliveries are slipping.",
    principle:
      "Keep the business moving with manual workarounds while the infected systems stay isolated.",
  },
  {
    title: "Possible data-theft claim",
    description:
      "A message claims employee and customer files were copied. You do not yet know if that is true.",
    principle:
      "Preserve logs and assess what was accessed before you speak in public or assume it is a bluff.",
  },
  {
    title: "Communications tower",
    description:
      "Management wants answers. Customers are calling. A journalist has already left a voicemail.",
    principle:
      "Tell people what you know, nothing you do not, and keep one coordinated message.",
  },
  {
    title: "Backup terminal",
    description:
      "The provider says backups exist. One copy looks clean. A newer copy sat on the affected network. A ransom note offers a decryptor.",
    principle:
      "Restore from a validated copy. Paying or restoring an unchecked backup can bring the attacker back.",
  },
  {
    title: "Core Server Room",
    description:
      "You are at the door of the room that holds Northstar’s most sensitive systems. The ransomware core is pulsing inside.",
    principle:
      "Close the incident with a real debrief and assigned actions, not a hopeful return to business as usual.",
  },
] as const;

export function choiceLetter(index: number): ChoiceLetter {
  const letter = CHOICE_LETTERS[index];
  if (!letter) {
    throw new Error(`No choice letter for option index ${index}`);
  }
  return letter;
}
