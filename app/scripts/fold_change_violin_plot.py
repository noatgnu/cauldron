import seaborn as sns
import pandas as pd
import seaborn.objects as so
import matplotlib.pyplot as plt

sns.set(font="Arial")
sns.set(rc={'figure.figsize': (6, 10)})
sns.set_style("white")
# df = pd.read_csv(r"C:\Users\Toan Phung\Downloads\ForCURTAIN_tTest_PBMC_Single_Six.txt", sep="\t")
df = pd.read_csv(r"C:\Users\Toan Phung\Downloads\For_Organelle_Profile.txt", sep="\t")

result = []

for i in df.columns:
    if i.startswith("Difference"):
        for i2, r in df.iterrows():
            for j in [
                "C..Lysosome",
                "C..Mitochondira",
                # "Lysosome",
                "Endosome",
                # "Mitochondria",
                "Golgi",
                "ER",
                "Ribosome",
                # "Nucleus",
                "Nuclear"
            ]:
                if r[j] == "+":
                    result.append([r[i], j, i])
                    break

result = pd.DataFrame(result, columns=[
    "Fold enrichment",
    "Organelle",
    "Comparison"
])

result["Organelle"] = pd.Categorical(result["Organelle"], [
    "C..Lysosome",
    "Endosome",
    "C..Mitochondira",
    # "Lysosome",
    # "Mitochondria",
    "Golgi",
    "ER",
    "Ribosome",
    # "Nucleus",
    "Nuclear"
], ordered=True)

for i, data in result.groupby("Comparison"):
    plt.cla()
    g = sns.violinplot(data, y="Organelle", x="Fold enrichment", order=["C..Lysosome",
                                                                        "Endosome",
                                                                        "C..Mitochondira",
                                                                        # "Lysosome",

                                                                        # "Mitochondria",
                                                                        "Golgi",
                                                                        "ER",
                                                                        "Ribosome",
                                                                        # "Nucleus",
                                                                        "Nuclear"], orient="h", hue="Organelle")
    a = sns.stripplot(data, y="Organelle", x="Fold enrichment", order=["C..Lysosome",
                                                                       "Endosome",
                                                                       "C..Mitochondira",
                                                                       # "Lysosome",

                                                                       # "Mitochondria",
                                                                       "Golgi",
                                                                       "ER",
                                                                       "Ribosome",
                                                                       # "Nucleus",
                                                                       "Nuclear"], orient="h", linewidth=1,
                      color="#ebebeb", alpha=0.2)
    fig = g.get_figure()
    fig.tight_layout()
    print(i)
    fig.savefig(f"{i.replace(':', '')}.pdf")
